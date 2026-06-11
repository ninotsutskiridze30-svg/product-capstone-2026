-- Notifications are created by SECURITY DEFINER triggers (the notifications table
-- has no INSERT policy, so app-side inserts are RLS-blocked). The triggers never
-- set actor_id, so the bell can't show "who" and message grouping/deep-links miss.
--
-- This migration teaches notify_user about actor_id and updates every trigger to
-- pass the acting user, then re-runs the message backfill with the correct
-- (snake_case) payload key the triggers actually emit.

-- ---------------------------------------------------------------------------
-- notify_user gains an actor argument. Signature change => drop + recreate.
-- (No app code calls this function; only the trigger functions below do.)
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.notify_user(uuid, text, text, text, jsonb);

CREATE FUNCTION public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_payload jsonb DEFAULT '{}',
  p_actor_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, payload, actor_id)
  VALUES (p_user_id, p_type, p_title, p_body, coalesce(p_payload, '{}'), p_actor_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- Messages: actor = sender. (The user's reported bug.)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv record;
  recipient uuid;
BEGIN
  SELECT tutor_id, student_id INTO conv
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF conv.tutor_id = NEW.sender_id THEN
    recipient := conv.student_id;
  ELSE
    recipient := conv.tutor_id;
  END IF;

  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  PERFORM public.notify_user(
    recipient,
    'message',
    'New message',
    left(NEW.content, 120),
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id),
    NEW.sender_id
  );
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Reviews: actor = student who left the review.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_user(
    NEW.tutor_id,
    'review',
    'New review',
    'You received a new review.',
    jsonb_build_object('review_id', NEW.id, 'session_id', NEW.session_id, 'student_id', NEW.student_id),
    NEW.student_id
  );
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Booking request: actor = student. Booking status change: actor = tutor.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_booking_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tid uuid;
BEGIN
  SELECT id INTO tid FROM public.tutor_profiles WHERE id = NEW.tutor_id;
  PERFORM public.notify_user(
    tid,
    'booking_request',
    'New booking request',
    'A student sent a booking request.',
    jsonb_build_object('booking_request_id', NEW.id, 'student_id', NEW.student_id),
    NEW.student_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_booking_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.notify_user(
      NEW.student_id,
      'booking_accepted',
      'Booking accepted',
      'Your tutor accepted the booking request.',
      jsonb_build_object('booking_request_id', NEW.id, 'tutor_id', NEW.tutor_id),
      NEW.tutor_id
    );
  ELSIF NEW.status = 'declined' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.notify_user(
      NEW.student_id,
      'booking_declined',
      'Booking declined',
      'Your tutor declined the booking request.',
      jsonb_build_object('booking_request_id', NEW.id, 'tutor_id', NEW.tutor_id),
      NEW.tutor_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Homework: submitted (actor = student), graded/revision (actor = tutor),
-- assigned (actor = tutor).
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
    ),
    NEW.student_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_homework_grade_after_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment uuid;
  v_student uuid;
  v_tutor uuid;
  v_title text;
  v_next_status text;
BEGIN
  SELECT s.assignment_id, s.student_id, a.title, a.tutor_id
  INTO v_assignment, v_student, v_title, v_tutor
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
    ),
    v_tutor
  );
  RETURN NEW;
END;
$$;

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
    ),
    NEW.tutor_id
  );
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Backfill existing message notifications. (0011 used the camelCase key, which
-- the triggers never emit, so it matched nothing — redo with snake_case.)
-- ---------------------------------------------------------------------------

UPDATE public.notifications n
SET actor_id = CASE
  WHEN c.tutor_id = n.user_id THEN c.student_id
  ELSE c.tutor_id
END
FROM public.conversations c
WHERE n.actor_id IS NULL
  AND n.type = 'message'
  AND (n.payload ->> 'conversation_id') IS NOT NULL
  AND (n.payload ->> 'conversation_id')::uuid = c.id;
