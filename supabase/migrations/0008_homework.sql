-- Homework: tutors assign work to connected students, students submit solutions, tutors grade.
-- Storage bucket required (create in Supabase Dashboard): `homework` (private; reads via signed URL from /api/upload).

-- ---------------------------------------------------------------------------
-- Extend notifications.type CHECK to include homework events.
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'booking_request', 'message', 'review',
    'session_reminder', 'booking_accepted', 'booking_declined',
    'booking_expired', 'booking_cancelled', 'booking_invite', 'booking_invite_declined',
    'homework_assigned', 'homework_submitted', 'homework_graded', 'homework_revision_requested'
  ));

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  attachment_url text,
  attachment_name text,
  attachment_size int,
  max_score numeric(6,2),
  status text NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'submitted', 'revision_requested', 'graded')),
  batch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX homework_assignments_tutor_idx
  ON public.homework_assignments (tutor_id, status, due_at);
CREATE INDEX homework_assignments_student_idx
  ON public.homework_assignments (student_id, status, due_at);
CREATE INDEX homework_assignments_batch_idx
  ON public.homework_assignments (batch_id);

CREATE TRIGGER homework_assignments_set_updated_at
  BEFORE UPDATE ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  attachment_url text,
  attachment_name text,
  attachment_size int,
  attempt_no int NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, attempt_no)
);

CREATE INDEX homework_submissions_assignment_idx
  ON public.homework_submissions (assignment_id, attempt_no DESC);

CREATE TABLE public.homework_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.homework_submissions(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric(6,2),
  max_score numeric(6,2),
  feedback text,
  outcome text NOT NULL CHECK (outcome IN ('graded', 'revision_requested')),
  graded_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Connection-exists guard: a tutor can only assign homework to a connected student.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_homework_assignment_requires_connection()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.tutor_id = NEW.tutor_id AND c.student_id = NEW.student_id
  ) THEN
    RAISE EXCEPTION 'No connection between tutor % and student %', NEW.tutor_id, NEW.student_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER homework_assignments_require_connection
  BEFORE INSERT ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_homework_assignment_requires_connection();

-- ---------------------------------------------------------------------------
-- Status transitions driven by submissions / grades.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_homework_submission_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tutor uuid;
  v_title text;
BEGIN
  UPDATE public.homework_assignments
  SET status = 'submitted'
  WHERE id = NEW.assignment_id;

  SELECT tutor_id, title INTO v_tutor, v_title
  FROM public.homework_assignments WHERE id = NEW.assignment_id;

  PERFORM public.notify_user(
    v_tutor,
    'homework_submitted',
    'Homework submitted',
    coalesce(v_title, 'A student submitted homework.'),
    jsonb_build_object(
      'assignment_id', NEW.assignment_id,
      'submission_id', NEW.id,
      'student_id', NEW.student_id,
      'attempt_no', NEW.attempt_no
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER homework_submissions_after_insert
  AFTER INSERT ON public.homework_submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_homework_submission_after_insert();

CREATE OR REPLACE FUNCTION public.trg_homework_grade_after_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment uuid;
  v_student uuid;
  v_title text;
  v_next_status text;
BEGIN
  SELECT s.assignment_id, s.student_id, a.title
  INTO v_assignment, v_student, v_title
  FROM public.homework_submissions s
  JOIN public.homework_assignments a ON a.id = s.assignment_id
  WHERE s.id = NEW.submission_id;

  v_next_status := CASE WHEN NEW.outcome = 'revision_requested'
    THEN 'revision_requested' ELSE 'graded' END;

  UPDATE public.homework_assignments
  SET status = v_next_status
  WHERE id = v_assignment;

  PERFORM public.notify_user(
    v_student,
    CASE WHEN NEW.outcome = 'revision_requested'
      THEN 'homework_revision_requested' ELSE 'homework_graded' END,
    CASE WHEN NEW.outcome = 'revision_requested'
      THEN 'Revision requested' ELSE 'Homework graded' END,
    coalesce(v_title, ''),
    jsonb_build_object(
      'assignment_id', v_assignment,
      'submission_id', NEW.submission_id,
      'grade_id', NEW.id,
      'outcome', NEW.outcome,
      'score', NEW.score,
      'max_score', NEW.max_score
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER homework_grades_after_write
  AFTER INSERT OR UPDATE ON public.homework_grades
  FOR EACH ROW EXECUTE FUNCTION public.trg_homework_grade_after_write();

-- Notify student when a new assignment is created (handled in app layer to allow batch summary too)
CREATE OR REPLACE FUNCTION public.trg_homework_assignment_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_user(
    NEW.student_id,
    'homework_assigned',
    'New homework',
    coalesce(NEW.title, 'You have new homework.'),
    jsonb_build_object(
      'assignment_id', NEW.id,
      'tutor_id', NEW.tutor_id,
      'due_at', NEW.due_at
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER homework_assignments_after_insert
  AFTER INSERT ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_homework_assignment_after_insert();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_grades ENABLE ROW LEVEL SECURITY;

-- homework_assignments
CREATE POLICY "homework_assignments_select_parties"
  ON public.homework_assignments FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "homework_assignments_tutor_insert"
  ON public.homework_assignments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "homework_assignments_tutor_update"
  ON public.homework_assignments FOR UPDATE TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "homework_assignments_tutor_delete"
  ON public.homework_assignments FOR DELETE TO authenticated
  USING (auth.uid() = tutor_id);

-- homework_submissions
CREATE POLICY "homework_submissions_select_parties"
  ON public.homework_submissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = homework_submissions.assignment_id
        AND (auth.uid() = a.tutor_id OR auth.uid() = a.student_id)
    )
  );

CREATE POLICY "homework_submissions_student_insert"
  ON public.homework_submissions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.homework_assignments a
      WHERE a.id = assignment_id
        AND a.student_id = auth.uid()
        AND a.status IN ('assigned', 'revision_requested')
    )
  );

-- homework_grades
CREATE POLICY "homework_grades_select_parties"
  ON public.homework_grades FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_submissions s
      JOIN public.homework_assignments a ON a.id = s.assignment_id
      WHERE s.id = homework_grades.submission_id
        AND (auth.uid() = a.tutor_id OR auth.uid() = a.student_id)
    )
  );

CREATE POLICY "homework_grades_tutor_write"
  ON public.homework_grades FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = tutor_id
    AND EXISTS (
      SELECT 1 FROM public.homework_submissions s
      JOIN public.homework_assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id AND a.tutor_id = auth.uid()
    )
  );

CREATE POLICY "homework_grades_tutor_update"
  ON public.homework_grades FOR UPDATE TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);
