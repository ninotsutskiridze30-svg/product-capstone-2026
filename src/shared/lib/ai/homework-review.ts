import "server-only";

import { createAdminClient } from "@/shared/api/supabase-admin";
import type { HomeworkAiReviewResult } from "@/entities/homework/model/homework.schema";
import {
  activeModel,
  generateReview,
  isHomeworkAiEnabled,
} from "./provider";
import type { AiAttachment } from "./types";

const MAX_AI_FILE_BYTES = 10 * 1024 * 1024; // skip AI on attachments larger than this
const MAX_TEXT_CHARS = 100_000; // cap inlined text/markdown/csv
const RUNNING_GUARD_MS = 2 * 60 * 1000; // treat a <2min running row as in-flight

const SYSTEM_PROMPT = `You are an assistant that helps a human tutor grade a student's homework submission. Your entire output is shown ONLY to the tutor — never to the student. It is advisory: the tutor makes every final decision.

You do three things:

1) ORIGINALITY (advisory signal — NOT a verdict): Estimate how likely the submission was written by an AI rather than the student, as a "likelihood_ai_generated" of low | medium | high, plus a "confidence" of low | medium | high, short "reasoning", and concrete "signals" you observed. This is a prompt to look closer, never proof. Detection is unreliable: a strong student, a non-native English writer, a short sample, or a formulaic genre can all read as "AI". NEVER accuse the student, never use the words "cheating" or "plagiarism", and never recommend any automatic penalty. When unsure, prefer "low" likelihood and "low" confidence and say why.

2) UNDERSTAND THE TASK: Reconstruct what was assigned (from the assignment title, description, attachment, and any private answer key / rubric the tutor provided) and what the student actually submitted (their text and/or attachment). The answer key and grading notes are private tutor material — use them to grade accurately, but do not quote them verbatim back in student-facing feedback.

3) EVALUATE: Produce a "suggested_score" (a number within the assignment's max score, or null if no max score is set and a number is not meaningful), a "per_criterion" breakdown (one entry per rubric criterion if a rubric is provided — use the given criterion ids, labels and max points; otherwise return an empty array), short "strengths" and "issues" lists, a "draft_feedback" written in a warm, specific, student-appropriate voice that the tutor can send as-is or edit, and a brief internal "summary" for the tutor.

Be fair, concrete, and encouraging. If the submission is empty, off-topic, or unreadable, say so plainly in "issues" and set a low or null score. Return ONLY the structured object.`;

type AdminClient = ReturnType<typeof createAdminClient>;

type RubricRow = {
  id: string;
  label: string;
  description: string | null;
  max_points: number;
  position: number;
};

function extensionOf(name: string): string {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  return dot >= 0 ? lower.slice(dot + 1) : "";
}

const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

/**
 * Download the submission attachment into a provider-neutral block. Returns a
 * null attachment + mode "unsupported" for Office/zip/oversized files.
 */
async function buildAttachment(
  admin: AdminClient,
  path: string,
  name: string | null
): Promise<{ attachment: AiAttachment | null; mode: string }> {
  const { data: blob, error } = await admin.storage.from("homework").download(path);
  if (error || !blob) return { attachment: null, mode: "unsupported" };
  const buffer = Buffer.from(await blob.arrayBuffer());
  if (buffer.byteLength > MAX_AI_FILE_BYTES) {
    return { attachment: null, mode: "unsupported" };
  }

  const ext = extensionOf(name ?? path);
  const base64 = buffer.toString("base64");

  if (ext === "pdf") {
    return {
      attachment: { kind: "pdf", mediaType: "application/pdf", base64 },
      mode: "pdf",
    };
  }
  const imageMime = IMAGE_MIME[ext];
  if (imageMime) {
    return {
      attachment: { kind: "image", mediaType: imageMime, base64 },
      mode: "image",
    };
  }
  if (ext === "txt" || ext === "md" || ext === "csv") {
    const text = buffer.toString("utf-8").slice(0, MAX_TEXT_CHARS);
    return {
      attachment: {
        kind: "text",
        text: `--- Student attachment (${name ?? path}) ---\n${text}`,
      },
      mode: "text",
    };
  }
  return { attachment: null, mode: "unsupported" };
}

function buildPromptText(args: {
  title: string;
  description: string | null;
  maxScore: number | null;
  submissionContent: string | null;
  hasAttachment: boolean;
  attachmentSupported: boolean;
  answerKey: string | null;
  gradingNotes: string | null;
  rubric: RubricRow[];
}): string {
  const lines: string[] = [];
  lines.push("# ASSIGNMENT");
  lines.push(`Title: ${args.title}`);
  if (args.description) lines.push(`Instructions: ${args.description}`);
  lines.push(`Maximum score: ${args.maxScore ?? "not set"}`);

  if (args.rubric.length > 0) {
    lines.push("\n# RUBRIC (grade per criterion; use these exact ids and labels)");
    for (const c of args.rubric) {
      lines.push(
        `- id=${c.id} | "${c.label}" | max_points=${c.max_points}${
          c.description ? ` | ${c.description}` : ""
        }`
      );
    }
  } else {
    lines.push("\n# RUBRIC\n(none — return an empty per_criterion array)");
  }

  if (args.answerKey || args.gradingNotes) {
    lines.push("\n# PRIVATE TUTOR MATERIAL (never shown to the student)");
    if (args.answerKey) lines.push(`Answer key / model solution:\n${args.answerKey}`);
    if (args.gradingNotes) lines.push(`Grading notes:\n${args.gradingNotes}`);
  }

  lines.push("\n# STUDENT SUBMISSION");
  if (args.submissionContent) {
    lines.push(`Written submission:\n${args.submissionContent.slice(0, MAX_TEXT_CHARS)}`);
  } else {
    lines.push("(no written text provided)");
  }
  if (args.hasAttachment) {
    lines.push(
      args.attachmentSupported
        ? "An attachment is included below for you to read and evaluate."
        : "NOTE: the student attached a file in a format that cannot be auto-read (e.g. Word/Excel/zip). Evaluate only the written text above, and add an issue noting the attachment needs manual review."
    );
  }

  lines.push(
    "\n# YOUR TASK\nAssess originality (advisory), then evaluate the submission against the assignment and rubric. Return the structured object only."
  );
  return lines.join("\n");
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function normalizeResult(
  result: HomeworkAiReviewResult,
  maxScore: number | null
): HomeworkAiReviewResult {
  const suggested =
    result.suggested_score == null
      ? null
      : maxScore != null
        ? clamp(result.suggested_score, 0, maxScore)
        : Math.max(result.suggested_score, 0);
  const perCriterion = result.per_criterion.map((c) => ({
    ...c,
    points_awarded: clamp(c.points_awarded, 0, c.max_points > 0 ? c.max_points : c.points_awarded),
  }));
  return { ...result, suggested_score: suggested, per_criterion: perCriterion };
}

/**
 * Run (or re-run) the AI review for a submission. Designed to be called from a
 * fire-and-forget `after()` in the submit route and from the re-analyze route.
 * Writes results to homework_ai_reviews via the service-role client (tutor-only RLS
 * governs reads). Never throws to the caller — failures are captured on the row.
 */
export async function runAiReview(
  submissionId: string,
  opts: { force?: boolean } = {}
): Promise<void> {
  const force = opts.force ?? false;
  if (!isHomeworkAiEnabled()) return;

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  const { data: submission } = await admin
    .from("homework_submissions")
    .select("id, assignment_id, student_id, content, attachment_url, attachment_name")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return;

  const { data: assignment } = await admin
    .from("homework_assignments")
    .select("id, tutor_id, title, description, max_score")
    .eq("id", submission.assignment_id)
    .maybeSingle();
  if (!assignment) return;

  // Existing reviews — drives idempotency + run_no.
  const { data: existing } = await admin
    .from("homework_ai_reviews")
    .select("id, run_no, status, started_at")
    .eq("submission_id", submissionId)
    .order("run_no", { ascending: false });
  const latest = existing?.[0];

  // Auto path: never duplicate an existing review.
  if (!force && latest) return;
  // Concurrency guard: a recent running row means another invocation is in flight.
  if (latest?.status === "running" && latest.started_at) {
    if (Date.now() - new Date(latest.started_at).getTime() < RUNNING_GUARD_MS) return;
  }
  const runNo = latest ? latest.run_no + 1 : 1;
  const model = activeModel();

  const { data: grading } = await admin
    .from("homework_assignment_grading")
    .select("answer_key, grading_notes, ai_enabled")
    .eq("assignment_id", assignment.id)
    .maybeSingle();

  // Per-assignment opt-out.
  if (grading && grading.ai_enabled === false) {
    await admin.from("homework_ai_reviews").insert({
      submission_id: submissionId,
      assignment_id: assignment.id,
      tutor_id: assignment.tutor_id,
      run_no: runNo,
      status: "skipped",
      model,
      max_score: assignment.max_score,
      error: "AI review is turned off for this assignment.",
      completed_at: new Date().toISOString(),
    });
    return;
  }

  const { data: rubricData } = await admin
    .from("homework_rubric_criteria")
    .select("id, label, description, max_points, position")
    .eq("assignment_id", assignment.id)
    .order("position", { ascending: true });
  const rubric: RubricRow[] = rubricData ?? [];

  // Insert the running row so the tutor UI can show "analyzing" immediately.
  const { data: inserted, error: insertErr } = await admin
    .from("homework_ai_reviews")
    .insert({
      submission_id: submissionId,
      assignment_id: assignment.id,
      tutor_id: assignment.tutor_id,
      run_no: runNo,
      status: "running",
      model,
      max_score: assignment.max_score,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insertErr || !inserted) return; // unique violation => another run won the race
  const reviewId = inserted.id;

  try {
    let attachmentMode = "none";
    let attachment: AiAttachment | null = null;
    if (submission.attachment_url) {
      const built = await buildAttachment(
        admin,
        submission.attachment_url,
        submission.attachment_name
      );
      attachment = built.attachment;
      attachmentMode = built.mode;
    }

    const promptText = buildPromptText({
      title: assignment.title,
      description: assignment.description,
      maxScore: assignment.max_score,
      submissionContent: submission.content,
      hasAttachment: Boolean(submission.attachment_url),
      attachmentSupported: attachment != null,
      answerKey: grading?.answer_key ?? null,
      gradingNotes: grading?.grading_notes ?? null,
      rubric,
    });

    const { result: rawResult, usage } = await generateReview({
      system: SYSTEM_PROMPT,
      prompt: promptText,
      attachment,
    });
    const result = normalizeResult(rawResult, assignment.max_score);

    await admin
      .from("homework_ai_reviews")
      .update({
        status: "complete",
        originality: result.originality,
        suggested_score: result.suggested_score,
        per_criterion: result.per_criterion,
        strengths: result.strengths,
        issues: result.issues,
        draft_feedback: result.draft_feedback,
        summary: result.summary,
        attachment_mode: attachmentMode,
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        cache_read_tokens: usage.cacheReadTokens,
        cache_write_tokens: usage.cacheWriteTokens,
        cost_usd: usage.costUsd,
        completed_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    // Notify the tutor (never the student) that a review is ready.
    await admin.from("notifications").insert({
      user_id: assignment.tutor_id,
      type: "homework_ai_review_ready",
      title: "AI review ready",
      body: assignment.title,
      payload: {
        assignment_id: assignment.id,
        submission_id: submissionId,
        review_id: reviewId,
        ok: true,
      },
      actor_id: null,
      is_read: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from("homework_ai_reviews")
      .update({
        status: "failed",
        error: message.slice(0, 1000),
        completed_at: new Date().toISOString(),
      })
      .eq("id", reviewId);
  }
}
