import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { gradeHomeworkInputSchema } from "@/entities/homework/model/homework.schema";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
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
  const parsed = gradeHomeworkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const tutorId = authResult.auth.userId;

  const { data: submission, error: subErr } = await supabase
    .from("homework_submissions")
    .select("id, assignment_id")
    .eq("id", parsed.data.submissionId)
    .maybeSingle();
  if (subErr || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.assignment_id !== params.data.id) {
    return NextResponse.json(
      { error: "Submission does not belong to this homework" },
      { status: 400 }
    );
  }

  const { data: assignment, error: aErr } = await supabase
    .from("homework_assignments")
    .select("id, tutor_id, max_score")
    .eq("id", params.data.id)
    .maybeSingle();
  if (aErr || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (assignment.tutor_id !== tutorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("homework_grades")
    .select("id")
    .eq("submission_id", submission.id)
    .maybeSingle();

  const payload = {
    submission_id: submission.id,
    tutor_id: tutorId,
    score: parsed.data.score ?? null,
    max_score: assignment.max_score,
    feedback: parsed.data.feedback ?? null,
    outcome: parsed.data.outcome,
    per_criterion: parsed.data.perCriterion ?? null,
    ai_review_id: parsed.data.aiReviewId ?? null,
    graded_at: new Date().toISOString(),
  };

  if (existing) {
    const { error: updErr } = await supabase
      .from("homework_grades")
      .update(payload)
      .eq("id", existing.id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
    return NextResponse.json({ id: existing.id });
  }

  const { data: inserted, error: insErr } = await supabase
    .from("homework_grades")
    .insert(payload)
    .select("id")
    .single();
  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? "Failed to grade" },
      { status: 500 }
    );
  }
  return NextResponse.json({ id: inserted.id });
}
