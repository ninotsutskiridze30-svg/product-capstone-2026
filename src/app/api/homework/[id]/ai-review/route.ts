import { cookies } from "next/headers";
import { NextResponse, after } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { runAiReview } from "@/shared/lib/ai/homework-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({ submissionId: z.string().uuid() });

const REVIEW_COLUMNS =
  "id, submission_id, run_no, status, model, originality, suggested_score, max_score, per_criterion, strengths, issues, draft_feedback, summary, attachment_mode, cost_usd, error, created_at, completed_at";

const RUNNING_GUARD_MS = 2 * 60 * 1000;

/**
 * Verify the submission belongs to this assignment and the caller is its tutor.
 * Returns the tutor id on success, or a NextResponse error to return.
 */
async function authorize(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  assignmentId: string,
  submissionId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const { data: submission } = await supabase
    .from("homework_submissions")
    .select("id, assignment_id")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) {
    return { ok: false, response: NextResponse.json({ error: "Submission not found" }, { status: 404 }) };
  }
  if (submission.assignment_id !== assignmentId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Submission does not belong to this homework" },
        { status: 400 }
      ),
    };
  }
  const { data: assignment } = await supabase
    .from("homework_assignments")
    .select("id, tutor_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) {
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (assignment.tutor_id !== userId) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true };
}

export async function GET(
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
  const submissionId = new URL(request.url).searchParams.get("submissionId");
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const userId = authResult.auth.userId;
  const auth = await authorize(supabase, params.data.id, submissionId, userId);
  if (!auth.ok) return auth.response;

  const { data: reviews, error } = await supabase
    .from("homework_ai_reviews")
    .select(REVIEW_COLUMNS)
    .eq("submission_id", submissionId)
    .order("run_no", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: reviews ?? [] });
}

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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const userId = authResult.auth.userId;
  const auth = await authorize(supabase, params.data.id, parsed.data.submissionId, userId);
  if (!auth.ok) return auth.response;

  // Reject if a run is already in flight.
  const { data: latest } = await supabase
    .from("homework_ai_reviews")
    .select("status, started_at")
    .eq("submission_id", parsed.data.submissionId)
    .order("run_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    latest?.status === "running" &&
    latest.started_at &&
    Date.now() - new Date(latest.started_at).getTime() < RUNNING_GUARD_MS
  ) {
    return NextResponse.json(
      { error: "An analysis is already in progress" },
      { status: 409 }
    );
  }

  const submissionId = parsed.data.submissionId;
  after(async () => {
    try {
      await runAiReview(submissionId, { force: true });
    } catch {
      // runAiReview captures its own failures on the review row.
    }
  });

  return NextResponse.json({ status: "pending" });
}
