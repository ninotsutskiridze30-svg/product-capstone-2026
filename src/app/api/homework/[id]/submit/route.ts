import { cookies } from "next/headers";
import { NextResponse, after } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { submitHomeworkInputSchema } from "@/entities/homework/model/homework.schema";
import { runAiReview } from "@/shared/lib/ai/homework-review";

export const dynamic = "force-dynamic";
// AI review runs in `after()`, within this route's budget. Give it room.
export const maxDuration = 300;

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth("student");
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
  const parsed = submitHomeworkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const studentId = authResult.auth.userId;

  const { data: assignment, error: readErr } = await supabase
    .from("homework_assignments")
    .select("id, student_id, status, due_at, allow_late")
    .eq("id", params.data.id)
    .maybeSingle();
  if (readErr || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (assignment.student_id !== studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (
    assignment.status !== "assigned" &&
    assignment.status !== "revision_requested"
  ) {
    return NextResponse.json(
      { error: "Submission is not open for this homework" },
      { status: 409 }
    );
  }
  if (
    assignment.allow_late === false &&
    assignment.due_at &&
    new Date(assignment.due_at).getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: "The deadline has passed and late submissions are not allowed" },
      { status: 409 }
    );
  }

  const { count, error: countErr } = await supabase
    .from("homework_submissions")
    .select("id", { count: "exact", head: true })
    .eq("assignment_id", assignment.id);
  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }
  const attemptNo = (count ?? 0) + 1;

  const { data: inserted, error: insertErr } = await supabase
    .from("homework_submissions")
    .insert({
      assignment_id: assignment.id,
      student_id: studentId,
      content: parsed.data.content ?? null,
      attachment_url: parsed.data.attachment?.path ?? null,
      attachment_name: parsed.data.attachment?.name ?? null,
      attachment_size: parsed.data.attachment?.size ?? null,
      attempt_no: attemptNo,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Failed to submit" },
      { status: 500 }
    );
  }

  // Fire-and-forget AI review for the tutor. Runs after the response is sent;
  // results land in homework_ai_reviews (tutor-only). The student never waits on it.
  const newSubmissionId = inserted.id;
  after(async () => {
    try {
      await runAiReview(newSubmissionId);
    } catch {
      // runAiReview captures its own failures on the review row.
    }
  });

  return NextResponse.json({ id: newSubmissionId });
}
