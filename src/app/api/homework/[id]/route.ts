import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { updateHomeworkInputSchema } from "@/entities/homework/model/homework.schema";
import {
  replaceRubric,
  upsertGradingConfig,
} from "@/entities/homework/server/grading.server";
import type { Database } from "@/shared/types/database.types";

type AssignmentUpdate = Database["public"]["Tables"]["homework_assignments"]["Update"];

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

type AiReviewRow = Database["public"]["Tables"]["homework_ai_reviews"]["Row"];

const ASSIGNMENT_COLUMNS =
  "id, tutor_id, student_id, title, description, due_at, attachment_url, attachment_name, attachment_size, max_score, allow_late, late_penalty_pct, status, batch_id, created_at, updated_at";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth();
  if ("response" in authResult) return authResult.response;

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const userId = authResult.auth.userId;

  const { data: assignment, error } = await supabase
    .from("homework_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("id", params.data.id)
    .maybeSingle();

  if (error || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isTutor = assignment.tutor_id === userId;
  const isStudent = assignment.student_id === userId;
  if (!isTutor && !isStudent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [{ data: partyProfiles }, { data: submissions }, { data: rubric }, { data: comments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", [assignment.tutor_id, assignment.student_id]),
      supabase
        .from("homework_submissions")
        .select("*")
        .eq("assignment_id", assignment.id)
        .order("attempt_no", { ascending: false }),
      supabase
        .from("homework_rubric_criteria")
        .select("id, assignment_id, label, description, max_points, position")
        .eq("assignment_id", assignment.id)
        .order("position", { ascending: true }),
      supabase
        .from("homework_comments")
        .select("id, assignment_id, author_id, author_role, body, created_at")
        .eq("assignment_id", assignment.id)
        .order("created_at", { ascending: true }),
    ]);

  const profileById = new Map(
    (partyProfiles ?? []).map((p) => [p.id, p] as const)
  );
  const peerId = isTutor ? assignment.student_id : assignment.tutor_id;
  const peer = profileById.get(peerId);

  const submissionIds = (submissions ?? []).map((s) => s.id);
  const { data: grades } =
    submissionIds.length > 0
      ? await supabase
          .from("homework_grades")
          .select(
            "id, submission_id, tutor_id, score, max_score, feedback, outcome, per_criterion, graded_at"
          )
          .in("submission_id", submissionIds)
      : { data: [] };
  const gradeBySubmission = new Map(
    (grades ?? []).map((g) => [g.submission_id, g] as const)
  );

  // TUTOR-ONLY: latest AI review per submission + private grading config.
  // The student branch never fetches or serializes either.
  const aiReviewBySubmission = new Map<string, AiReviewRow>();
  let grading: {
    answer_key: string | null;
    grading_notes: string | null;
    ai_enabled: boolean;
  } | null = null;
  if (isTutor) {
    if (submissionIds.length > 0) {
      const { data: reviews } = await supabase
        .from("homework_ai_reviews")
        .select("*")
        .in("submission_id", submissionIds)
        .order("run_no", { ascending: false });
      for (const r of reviews ?? []) {
        if (!aiReviewBySubmission.has(r.submission_id)) {
          aiReviewBySubmission.set(r.submission_id, r); // first seen = highest run_no
        }
      }
    }
    const { data: cfg } = await supabase
      .from("homework_assignment_grading")
      .select("answer_key, grading_notes, ai_enabled")
      .eq("assignment_id", assignment.id)
      .maybeSingle();
    grading = cfg ?? null;
  }

  const dueAtMs = assignment.due_at ? new Date(assignment.due_at).getTime() : null;
  const enrichedSubmissions = (submissions ?? []).map((s) => ({
    ...s,
    grade: gradeBySubmission.get(s.id) ?? null,
    // Only present for tutors; omitted entirely (undefined) for students.
    aiReview: isTutor ? aiReviewBySubmission.get(s.id) ?? null : undefined,
    isLate:
      dueAtMs != null
        ? new Date(s.submitted_at).getTime() > dueAtMs
        : false,
  }));

  const enrichedComments = (comments ?? []).map((c) => ({
    ...c,
    authorName: profileById.get(c.author_id)?.full_name ?? "User",
    authorAvatarUrl: profileById.get(c.author_id)?.avatar_url ?? null,
  }));

  const latest = enrichedSubmissions[0] ?? null;

  return NextResponse.json({
    ...assignment,
    peerName: peer?.full_name ?? "User",
    peerAvatarUrl: peer?.avatar_url ?? null,
    submissions: enrichedSubmissions,
    rubric: rubric ?? [],
    comments: enrichedComments,
    ...(isTutor ? { grading } : {}),
    latestSubmission: latest,
    latestGrade: latest?.grade ?? null,
    submissionCount: enrichedSubmissions.length,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth("tutor");
  if ("response" in authResult) return authResult.response;

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateHomeworkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { data: current, error: readErr } = await supabase
    .from("homework_assignments")
    .select("id, tutor_id, status")
    .eq("id", params.data.id)
    .maybeSingle();
  if (readErr || !current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (current.tutor_id !== authResult.auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (current.status !== "assigned") {
    return NextResponse.json(
      { error: "Cannot edit homework once a student has submitted" },
      { status: 409 }
    );
  }

  const patch: AssignmentUpdate = {};
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.dueAt !== undefined) patch.due_at = parsed.data.dueAt;
  if (parsed.data.maxScore !== undefined) patch.max_score = parsed.data.maxScore;
  if (parsed.data.allowLate !== undefined) patch.allow_late = parsed.data.allowLate;
  if (parsed.data.latePenaltyPct !== undefined)
    patch.late_penalty_pct = parsed.data.latePenaltyPct;

  let updated: unknown = null;
  if (Object.keys(patch).length > 0) {
    const { data, error: updateErr } = await supabase
      .from("homework_assignments")
      .update(patch)
      .eq("id", current.id)
      .select(ASSIGNMENT_COLUMNS)
      .single();
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    updated = data;
  } else {
    const { data } = await supabase
      .from("homework_assignments")
      .select(ASSIGNMENT_COLUMNS)
      .eq("id", current.id)
      .single();
    updated = data;
  }

  // Persist optional rubric + private grading config edits (same edit-lock applies).
  await upsertGradingConfig(supabase, current.id, authResult.auth.userId, {
    answerKey: parsed.data.answerKey,
    gradingNotes: parsed.data.gradingNotes,
    aiEnabled: parsed.data.aiEnabled,
  });
  await replaceRubric(supabase, current.id, parsed.data.rubric);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth("tutor");
  if ("response" in authResult) return authResult.response;

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: current, error: readErr } = await supabase
    .from("homework_assignments")
    .select("id, tutor_id")
    .eq("id", params.data.id)
    .maybeSingle();
  if (readErr || !current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (current.tutor_id !== authResult.auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase
    .from("homework_assignments")
    .delete()
    .eq("id", current.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: current.id, deleted: true });
}
