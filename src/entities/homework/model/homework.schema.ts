import { z } from "zod";

export const HomeworkStatusSchema = z.enum([
  "assigned",
  "submitted",
  "revision_requested",
  "graded",
]);

export const HomeworkOutcomeSchema = z.enum(["graded", "revision_requested"]);

export const HomeworkAttachmentSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().nonnegative().nullable().optional(),
});

export type HomeworkAttachment = z.infer<typeof HomeworkAttachmentSchema>;

// ---------- Rubric ----------

export const RubricCriterionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  label: z.string(),
  description: z.string().nullable(),
  max_points: z.number(),
  position: z.number().int(),
});

export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;

// ---------- AI review ----------

export const AiLikelihoodSchema = z.enum(["low", "medium", "high"]);
export const AiConfidenceSchema = z.enum(["low", "medium", "high"]);

export const AiOriginalitySchema = z.object({
  likelihood_ai_generated: AiLikelihoodSchema,
  confidence: AiConfidenceSchema,
  reasoning: z.string(),
  signals: z.array(z.string()),
});
export type AiOriginality = z.infer<typeof AiOriginalitySchema>;

export const AiPerCriterionSchema = z.object({
  criterion_id: z.string().nullable().optional(),
  label: z.string(),
  points_awarded: z.number(),
  max_points: z.number(),
  justification: z.string(),
});
export type AiPerCriterion = z.infer<typeof AiPerCriterionSchema>;

// The structured result the model must return. NOTE: no numeric min/max here —
// structured-output JSON Schema can't express them; clamp scores in code.
export const HomeworkAiReviewResultSchema = z.object({
  originality: AiOriginalitySchema,
  suggested_score: z.number().nullable(),
  per_criterion: z.array(AiPerCriterionSchema),
  strengths: z.array(z.string()),
  issues: z.array(z.string()),
  draft_feedback: z.string(),
  summary: z.string(),
});
export type HomeworkAiReviewResult = z.infer<typeof HomeworkAiReviewResultSchema>;

export const HomeworkAiReviewStatusSchema = z.enum([
  "pending",
  "running",
  "complete",
  "failed",
  "skipped",
]);
export type HomeworkAiReviewStatus = z.infer<
  typeof HomeworkAiReviewStatusSchema
>;

// The stored review row, returned to the TUTOR ONLY.
export const HomeworkAiReviewSchema = z.object({
  id: z.string().uuid(),
  submission_id: z.string().uuid(),
  run_no: z.number().int(),
  status: HomeworkAiReviewStatusSchema,
  model: z.string().nullable(),
  originality: AiOriginalitySchema.nullable(),
  suggested_score: z.number().nullable(),
  max_score: z.number().nullable(),
  per_criterion: z.array(AiPerCriterionSchema).nullable(),
  strengths: z.array(z.string()).nullable(),
  issues: z.array(z.string()).nullable(),
  draft_feedback: z.string().nullable(),
  summary: z.string().nullable(),
  attachment_mode: z.string().nullable(),
  cost_usd: z.number().nullable(),
  error: z.string().nullable(),
  created_at: z.string(),
  completed_at: z.string().nullable(),
});
export type HomeworkAiReview = z.infer<typeof HomeworkAiReviewSchema>;

// ---------- Grade per-criterion (tutor-approved, student-visible) ----------

export const GradePerCriterionSchema = z.object({
  criterion_id: z.string().nullable().optional(),
  label: z.string(),
  points_awarded: z.number(),
  max_points: z.number(),
});
export type GradePerCriterion = z.infer<typeof GradePerCriterionSchema>;

// ---------- Grading config (tutor-only) ----------

export const HomeworkGradingConfigSchema = z.object({
  answer_key: z.string().nullable(),
  grading_notes: z.string().nullable(),
  ai_enabled: z.boolean(),
});
export type HomeworkGradingConfig = z.infer<typeof HomeworkGradingConfigSchema>;

// ---------- Comments (party-visible) ----------

export const HomeworkCommentSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  author_id: z.string().uuid(),
  author_role: z.enum(["tutor", "student"]),
  body: z.string(),
  created_at: z.string(),
  authorName: z.string().optional(),
  authorAvatarUrl: z.string().nullable().optional(),
});
export type HomeworkComment = z.infer<typeof HomeworkCommentSchema>;

export const HomeworkSubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  content: z.string().nullable(),
  attachment_url: z.string().nullable(),
  attachment_name: z.string().nullable(),
  attachment_size: z.number().nullable(),
  attempt_no: z.number().int().positive(),
  submitted_at: z.string(),
});

export const HomeworkGradeSchema = z.object({
  id: z.string().uuid(),
  submission_id: z.string().uuid(),
  tutor_id: z.string().uuid(),
  score: z.number().nullable(),
  max_score: z.number().nullable(),
  feedback: z.string().nullable(),
  outcome: HomeworkOutcomeSchema,
  per_criterion: z.array(GradePerCriterionSchema).nullable().optional(),
  graded_at: z.string(),
});

export const HomeworkAssignmentSchema = z.object({
  id: z.string().uuid(),
  tutor_id: z.string().uuid(),
  student_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  due_at: z.string().nullable(),
  attachment_url: z.string().nullable(),
  attachment_name: z.string().nullable(),
  attachment_size: z.number().nullable(),
  max_score: z.number().nullable(),
  allow_late: z.boolean().optional(),
  late_penalty_pct: z.number().nullable().optional(),
  status: HomeworkStatusSchema,
  batch_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  peerName: z.string().optional(),
  peerAvatarUrl: z.string().nullable().optional(),
  latestSubmission: HomeworkSubmissionSchema.nullable().optional(),
  latestGrade: HomeworkGradeSchema.nullable().optional(),
  submissionCount: z.number().optional(),
  rubric: z.array(RubricCriterionSchema).optional(),
});

export const HomeworkSubmissionWithGradeSchema = HomeworkSubmissionSchema.extend(
  {
    grade: HomeworkGradeSchema.nullable().optional(),
    // Tutor-only. Never populated on the student branch of the detail route.
    aiReview: HomeworkAiReviewSchema.nullable().optional(),
    isLate: z.boolean().optional(),
  }
);
export type HomeworkSubmissionWithGrade = z.infer<
  typeof HomeworkSubmissionWithGradeSchema
>;

export const HomeworkAssignmentDetailSchema = HomeworkAssignmentSchema.extend({
  submissions: z.array(HomeworkSubmissionWithGradeSchema),
  comments: z.array(HomeworkCommentSchema).optional(),
  // Tutor-only. Never populated on the student branch of the detail route.
  grading: HomeworkGradingConfigSchema.nullable().optional(),
});

export const HomeworkListResponseSchema = z.object({
  items: z.array(HomeworkAssignmentSchema),
});

export type HomeworkStatus = z.infer<typeof HomeworkStatusSchema>;
export type HomeworkOutcome = z.infer<typeof HomeworkOutcomeSchema>;
export type HomeworkSubmission = z.infer<typeof HomeworkSubmissionSchema>;
export type HomeworkGrade = z.infer<typeof HomeworkGradeSchema>;
export type HomeworkAssignment = z.infer<typeof HomeworkAssignmentSchema>;
export type HomeworkAssignmentDetail = z.infer<
  typeof HomeworkAssignmentDetailSchema
>;

// ---------- Form / payload schemas ----------

export const rubricCriterionInputSchema = z.object({
  label: z.string().trim().min(1, "Criterion needs a label").max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  maxPoints: z.number().positive().max(10000),
});

export type RubricCriterionInput = z.infer<typeof rubricCriterionInputSchema>;

// Fields shared by create + update for grading config / rubric / late policy.
const homeworkGradingFields = {
  rubric: z.array(rubricCriterionInputSchema).max(30).optional(),
  answerKey: z.string().trim().max(20000).optional().nullable(),
  gradingNotes: z.string().trim().max(10000).optional().nullable(),
  aiEnabled: z.boolean().optional(),
  allowLate: z.boolean().optional(),
  latePenaltyPct: z.number().min(0).max(100).optional().nullable(),
};

export const createHomeworkInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000).optional().nullable(),
    dueAt: z.string().datetime().optional().nullable(),
    maxScore: z.number().positive().max(10000).optional().nullable(),
    attachment: HomeworkAttachmentSchema.optional().nullable(),
    studentIds: z.array(z.string().uuid()).default([]),
    groupIds: z.array(z.string().uuid()).default([]),
    ...homeworkGradingFields,
  })
  .refine((v) => v.studentIds.length > 0 || v.groupIds.length > 0, {
    message: "Pick at least one student or group",
    path: ["studentIds"],
  });

export type CreateHomeworkInput = z.infer<typeof createHomeworkInputSchema>;

export const updateHomeworkInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  maxScore: z.number().positive().max(10000).nullable().optional(),
  ...homeworkGradingFields,
});

export type UpdateHomeworkInput = z.infer<typeof updateHomeworkInputSchema>;

export const submitHomeworkInputSchema = z.object({
  content: z.string().trim().max(10000).optional().nullable(),
  attachment: HomeworkAttachmentSchema.optional().nullable(),
}).refine(
  (v) => (v.content && v.content.length > 0) || !!v.attachment,
  { message: "Add a note or an attachment", path: ["content"] }
);

export type SubmitHomeworkInput = z.infer<typeof submitHomeworkInputSchema>;

export const gradeHomeworkInputSchema = z.object({
  submissionId: z.string().uuid(),
  outcome: HomeworkOutcomeSchema,
  score: z.number().min(0).max(10000).nullable().optional(),
  feedback: z.string().trim().max(5000).nullable().optional(),
  perCriterion: z
    .array(
      z.object({
        criterion_id: z.string().uuid().nullable().optional(),
        label: z.string().max(200),
        points_awarded: z.number().min(0).max(10000),
        max_points: z.number().min(0).max(10000),
      })
    )
    .max(30)
    .nullable()
    .optional(),
  aiReviewId: z.string().uuid().nullable().optional(),
});

export type GradeHomeworkInput = z.infer<typeof gradeHomeworkInputSchema>;

export const createCommentInputSchema = z.object({
  body: z.string().trim().min(1, "Write a message").max(5000),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
