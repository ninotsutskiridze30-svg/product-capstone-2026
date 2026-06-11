import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/types/database.types";
import type { RubricCriterionInput } from "../model/homework.schema";

type Client = SupabaseClient<Database>;

/**
 * Upsert the tutor-private grading config (answer key / notes / AI toggle) for an
 * assignment. No-op when none of the fields were provided in the request so a
 * plain edit doesn't wipe an existing answer key.
 */
export async function upsertGradingConfig(
  supabase: Client,
  assignmentId: string,
  tutorId: string,
  input: {
    answerKey?: string | null | undefined;
    gradingNotes?: string | null | undefined;
    aiEnabled?: boolean | undefined;
  }
): Promise<void> {
  const hasAny =
    input.answerKey !== undefined ||
    input.gradingNotes !== undefined ||
    input.aiEnabled !== undefined;
  if (!hasAny) return;

  await supabase.from("homework_assignment_grading").upsert(
    {
      assignment_id: assignmentId,
      tutor_id: tutorId,
      answer_key: input.answerKey ?? null,
      grading_notes: input.gradingNotes ?? null,
      ai_enabled: input.aiEnabled ?? true,
    },
    { onConflict: "assignment_id" }
  );
}

/**
 * Replace an assignment's rubric criteria with the provided list. `undefined`
 * means "leave untouched"; an empty array means "clear the rubric".
 */
export async function replaceRubric(
  supabase: Client,
  assignmentId: string,
  rubric: RubricCriterionInput[] | undefined
): Promise<void> {
  if (rubric === undefined) return;

  await supabase
    .from("homework_rubric_criteria")
    .delete()
    .eq("assignment_id", assignmentId);

  if (rubric.length === 0) return;

  const rows = rubric.map((c, i) => ({
    assignment_id: assignmentId,
    label: c.label,
    description: c.description ?? null,
    max_points: c.maxPoints,
    position: i,
  }));
  await supabase.from("homework_rubric_criteria").insert(rows);
}
