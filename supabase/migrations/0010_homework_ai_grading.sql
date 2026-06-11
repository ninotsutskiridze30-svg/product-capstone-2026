-- Homework AI grading + rubric + private grading config + discussion thread.
-- Builds on 0008_homework.sql. Adds:
--   * tutor-private grading config (answer key / notes)  -> homework_assignment_grading
--   * student-visible rubric criteria                     -> homework_rubric_criteria
--   * tutor-only AI review results                         -> homework_ai_reviews
--   * party-visible per-assignment discussion thread       -> homework_comments
--   * per-criterion breakdown + AI linkage on grades, late policy on assignments
--   * tutor notification type 'homework_ai_review_ready'
--
-- PRIVACY INVARIANT: the answer key and ALL AI output live in tables with NO
-- student RLS SELECT policy, so they are unreachable by students even via a
-- direct PostgREST query (Postgres RLS is row-level, not column-level).

-- ---------------------------------------------------------------------------
-- Extend notifications.type CHECK with the tutor-only AI review event.
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'booking_request', 'message', 'review',
    'session_reminder', 'booking_accepted', 'booking_declined',
    'booking_expired', 'booking_cancelled', 'booking_invite', 'booking_invite_declined',
    'homework_assigned', 'homework_submitted', 'homework_graded', 'homework_revision_requested',
    'homework_ai_review_ready'
  ));

-- ---------------------------------------------------------------------------
-- Late-submission policy on assignments (student-visible).
-- ---------------------------------------------------------------------------

ALTER TABLE public.homework_assignments
  ADD COLUMN IF NOT EXISTS allow_late boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS late_penalty_pct numeric(5,2);

-- ---------------------------------------------------------------------------
-- Tutor-private grading config (answer key / grading notes). 1:1 with assignment.
-- ---------------------------------------------------------------------------

CREATE TABLE public.homework_assignment_grading (
  assignment_id uuid PRIMARY KEY REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  tutor_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_key    text,
  grading_notes text,
  ai_enabled    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER homework_assignment_grading_set_updated_at
  BEFORE UPDATE ON public.homework_assignment_grading
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Rubric criteria (student-visible for transparency; tutor-written).
-- Contains visible guidance only, NEVER private model solutions.
-- ---------------------------------------------------------------------------

CREATE TABLE public.homework_rubric_criteria (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  label         text NOT NULL,
  description   text,
  max_points    numeric(6,2) NOT NULL,
  position      int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX homework_rubric_criteria_assignment_idx
  ON public.homework_rubric_criteria (assignment_id, position);

-- ---------------------------------------------------------------------------
-- AI reviews (TUTOR-ONLY). Rows are written by the background job via the
-- service-role client (bypasses RLS); the tutor-only SELECT policy governs reads.
-- 1:many with submission via run_no so "Re-analyze" keeps history.
-- ---------------------------------------------------------------------------

CREATE TABLE public.homework_ai_reviews (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id      uuid NOT NULL REFERENCES public.homework_submissions(id) ON DELETE CASCADE,
  assignment_id      uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  tutor_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_no             int NOT NULL DEFAULT 1,
  status             text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'complete', 'failed', 'skipped')),
  model              text,
  originality        jsonb,
  suggested_score    numeric(6,2),
  max_score          numeric(6,2),
  per_criterion      jsonb,
  strengths          jsonb,
  issues             jsonb,
  draft_feedback     text,
  summary            text,
  attachment_mode    text,
  input_tokens       int,
  output_tokens      int,
  cache_read_tokens  int,
  cache_write_tokens int,
  cost_usd           numeric(10,4),
  error              text,
  started_at         timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, run_no)
);

CREATE INDEX homework_ai_reviews_submission_idx
  ON public.homework_ai_reviews (submission_id, run_no DESC);

CREATE TRIGGER homework_ai_reviews_set_updated_at
  BEFORE UPDATE ON public.homework_ai_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Per-assignment discussion thread (party-visible).
-- ---------------------------------------------------------------------------

CREATE TABLE public.homework_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_role   text NOT NULL CHECK (author_role IN ('tutor', 'student')),
  body          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX homework_comments_assignment_idx
  ON public.homework_comments (assignment_id, created_at);

-- ---------------------------------------------------------------------------
-- Grade: per-criterion breakdown (student-visible, tutor-approved) + AI linkage
-- (tutor-only join; never serialized to students). FK added after the AI table.
-- ---------------------------------------------------------------------------

ALTER TABLE public.homework_grades
  ADD COLUMN IF NOT EXISTS per_criterion jsonb,
  ADD COLUMN IF NOT EXISTS ai_review_id uuid REFERENCES public.homework_ai_reviews(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.homework_assignment_grading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_comments ENABLE ROW LEVEL SECURITY;

-- homework_assignment_grading: TUTOR-ONLY. No student policy => unreachable by students.
CREATE POLICY "hw_grading_tutor_select"
  ON public.homework_assignment_grading FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id);

CREATE POLICY "hw_grading_tutor_insert"
  ON public.homework_assignment_grading FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "hw_grading_tutor_update"
  ON public.homework_assignment_grading FOR UPDATE TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "hw_grading_tutor_delete"
  ON public.homework_assignment_grading FOR DELETE TO authenticated
  USING (auth.uid() = tutor_id);

-- homework_rubric_criteria: parties read; tutor writes.
CREATE POLICY "hw_rubric_select_parties"
  ON public.homework_rubric_criteria FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = homework_rubric_criteria.assignment_id
        AND (auth.uid() = a.tutor_id OR auth.uid() = a.student_id)
    )
  );

CREATE POLICY "hw_rubric_tutor_insert"
  ON public.homework_rubric_criteria FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = assignment_id AND a.tutor_id = auth.uid()
    )
  );

CREATE POLICY "hw_rubric_tutor_update"
  ON public.homework_rubric_criteria FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = homework_rubric_criteria.assignment_id AND a.tutor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = assignment_id AND a.tutor_id = auth.uid()
    )
  );

CREATE POLICY "hw_rubric_tutor_delete"
  ON public.homework_rubric_criteria FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = homework_rubric_criteria.assignment_id AND a.tutor_id = auth.uid()
    )
  );

-- homework_ai_reviews: TUTOR-ONLY SELECT. No student policy. Writes via service role.
CREATE POLICY "hw_ai_reviews_tutor_select"
  ON public.homework_ai_reviews FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id);

-- homework_comments: parties read; each party inserts their own messages.
CREATE POLICY "hw_comments_select_parties"
  ON public.homework_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = homework_comments.assignment_id
        AND (auth.uid() = a.tutor_id OR auth.uid() = a.student_id)
    )
  );

CREATE POLICY "hw_comments_insert_parties"
  ON public.homework_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = assignment_id
        AND (auth.uid() = a.tutor_id OR auth.uid() = a.student_id)
    )
  );
