import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { createHomeworkInputSchema } from "@/entities/homework/model/homework.schema";
import {
  replaceRubric,
  upsertGradingConfig,
} from "@/entities/homework/server/grading.server";

export const dynamic = "force-dynamic";

const STATUS_VALUES = [
  "assigned",
  "submitted",
  "revision_requested",
  "graded",
] as const;
type Status = (typeof STATUS_VALUES)[number];

export async function GET(request: Request) {
  await cookies();
  const authResult = await requireAuth();
  if ("response" in authResult) return authResult.response;

  const userId = authResult.auth.userId;
  const role = authResult.auth.role;
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const studentIdParam = url.searchParams.get("studentId");
  const tutorIdParam = url.searchParams.get("tutorId");
  const batchIdParam = url.searchParams.get("batchId");

  const supabase = await createServerClient();
  let query = supabase
    .from("homework_assignments")
    .select(
      "id, tutor_id, student_id, title, description, due_at, attachment_url, attachment_name, attachment_size, max_score, allow_late, late_penalty_pct, status, batch_id, created_at, updated_at"
    )
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "tutor") {
    query = query.eq("tutor_id", userId);
    if (studentIdParam) query = query.eq("student_id", studentIdParam);
  } else if (role === "student") {
    query = query.eq("student_id", userId);
    if (tutorIdParam) query = query.eq("tutor_id", tutorIdParam);
  } else {
    query = query.or(`tutor_id.eq.${userId},student_id.eq.${userId}`);
  }

  if (statusParam && (STATUS_VALUES as readonly string[]).includes(statusParam)) {
    query = query.eq("status", statusParam as Status);
  }
  if (batchIdParam) query = query.eq("batch_id", batchIdParam);

  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const assignments = rows ?? [];
  if (assignments.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const assignmentIds = assignments.map((a) => a.id);
  const peerIds = Array.from(
    new Set(
      assignments.map((a) => (role === "tutor" ? a.student_id : a.tutor_id))
    )
  );

  const [{ data: peerProfiles }, { data: latestSubs }] = await Promise.all([
    peerIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", peerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; avatar_url: string | null }> }),
    supabase
      .from("homework_submissions")
      .select(
        "id, assignment_id, student_id, content, attachment_url, attachment_name, attachment_size, attempt_no, submitted_at"
      )
      .in("assignment_id", assignmentIds)
      .order("attempt_no", { ascending: false }),
  ]);

  const peerById = new Map(
    (peerProfiles ?? []).map((p) => [p.id, p] as const)
  );

  const submissionsByAssignment = new Map<
    string,
    Array<{
      id: string;
      assignment_id: string;
      student_id: string;
      content: string | null;
      attachment_url: string | null;
      attachment_name: string | null;
      attachment_size: number | null;
      attempt_no: number;
      submitted_at: string;
    }>
  >();
  for (const sub of latestSubs ?? []) {
    const list = submissionsByAssignment.get(sub.assignment_id) ?? [];
    list.push(sub);
    submissionsByAssignment.set(sub.assignment_id, list);
  }

  const latestSubmissionIds: string[] = [];
  for (const subs of submissionsByAssignment.values()) {
    if (subs[0]) latestSubmissionIds.push(subs[0].id);
  }

  const { data: grades } =
    latestSubmissionIds.length > 0
      ? await supabase
          .from("homework_grades")
          .select(
            "id, submission_id, tutor_id, score, max_score, feedback, outcome, graded_at"
          )
          .in("submission_id", latestSubmissionIds)
      : { data: [] as Array<{ id: string; submission_id: string; tutor_id: string; score: number | null; max_score: number | null; feedback: string | null; outcome: "graded" | "revision_requested"; graded_at: string }> };

  const gradeBySubmission = new Map(
    (grades ?? []).map((g) => [g.submission_id, g] as const)
  );

  const items = assignments.map((a) => {
    const peerId = role === "tutor" ? a.student_id : a.tutor_id;
    const peer = peerById.get(peerId);
    const subs = submissionsByAssignment.get(a.id) ?? [];
    const latest = subs[0] ?? null;
    const latestGrade = latest ? gradeBySubmission.get(latest.id) ?? null : null;
    return {
      ...a,
      peerName: peer?.full_name ?? "User",
      peerAvatarUrl: peer?.avatar_url ?? null,
      latestSubmission: latest,
      latestGrade,
      submissionCount: subs.length,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  await cookies();
  const authResult = await requireAuth("tutor");
  if ("response" in authResult) return authResult.response;
  const tutorId = authResult.auth.userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createHomeworkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const studentIdSet = new Set<string>(parsed.data.studentIds);

  if (parsed.data.groupIds.length > 0) {
    const { data: groups, error: groupErr } = await supabase
      .from("student_groups")
      .select("id, tutor_id")
      .in("id", parsed.data.groupIds);
    if (groupErr) {
      return NextResponse.json({ error: groupErr.message }, { status: 500 });
    }
    const ownedGroupIds = (groups ?? [])
      .filter((g) => g.tutor_id === tutorId)
      .map((g) => g.id);
    if (ownedGroupIds.length !== parsed.data.groupIds.length) {
      return NextResponse.json(
        { error: "Cannot assign to a group you don't own" },
        { status: 403 }
      );
    }
    if (ownedGroupIds.length > 0) {
      const { data: members, error: memberErr } = await supabase
        .from("group_members")
        .select("student_id, status")
        .in("group_id", ownedGroupIds)
        .eq("status", "active");
      if (memberErr) {
        return NextResponse.json({ error: memberErr.message }, { status: 500 });
      }
      for (const m of members ?? []) {
        studentIdSet.add(m.student_id);
      }
    }
  }

  if (studentIdSet.size === 0) {
    return NextResponse.json(
      { error: "No students resolved from selection" },
      { status: 400 }
    );
  }

  const studentIds = Array.from(studentIdSet);

  const { data: connections, error: connErr } = await supabase
    .from("connections")
    .select("student_id")
    .eq("tutor_id", tutorId)
    .in("student_id", studentIds);

  if (connErr) {
    return NextResponse.json({ error: connErr.message }, { status: 500 });
  }
  const connectedIds = new Set((connections ?? []).map((c) => c.student_id));
  const unconnected = studentIds.filter((id) => !connectedIds.has(id));
  if (unconnected.length > 0) {
    return NextResponse.json(
      {
        error: `Not connected to ${unconnected.length} of the selected students`,
      },
      { status: 403 }
    );
  }

  const batchId = studentIds.length > 1 ? crypto.randomUUID() : null;

  const rows = studentIds.map((studentId) => ({
    tutor_id: tutorId,
    student_id: studentId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    due_at: parsed.data.dueAt ?? null,
    attachment_url: parsed.data.attachment?.path ?? null,
    attachment_name: parsed.data.attachment?.name ?? null,
    attachment_size: parsed.data.attachment?.size ?? null,
    max_score: parsed.data.maxScore ?? null,
    allow_late: parsed.data.allowLate ?? true,
    late_penalty_pct: parsed.data.latePenaltyPct ?? null,
    batch_id: batchId,
  }));

  const { data: inserted, error: insertErr } = await supabase
    .from("homework_assignments")
    .insert(rows)
    .select(
      "id, tutor_id, student_id, title, description, due_at, attachment_url, attachment_name, attachment_size, max_score, allow_late, late_penalty_pct, status, batch_id, created_at, updated_at"
    );

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Persist the (optional) rubric + private grading config for each assignment.
  // Best-effort: a failure here must not orphan the already-created assignments.
  const hasGradingExtras =
    parsed.data.rubric !== undefined ||
    parsed.data.answerKey !== undefined ||
    parsed.data.gradingNotes !== undefined ||
    parsed.data.aiEnabled !== undefined;
  if (hasGradingExtras && inserted) {
    await Promise.all(
      inserted.map(async (a) => {
        await upsertGradingConfig(supabase, a.id, tutorId, {
          answerKey: parsed.data.answerKey,
          gradingNotes: parsed.data.gradingNotes,
          aiEnabled: parsed.data.aiEnabled,
        });
        await replaceRubric(supabase, a.id, parsed.data.rubric);
      })
    );
  }

  return NextResponse.json({ batch_id: batchId, created: inserted ?? [] });
}
