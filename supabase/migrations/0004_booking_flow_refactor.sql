-- Booking/calendar refactor for transactional slot locking and lifecycle tracking.
-- TODO: Add dedicated recurring_blocks model for tutor weekly blocked patterns.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------------
-- Booking request shape updates
-- ---------------------------------------------------------------------------

ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS requested_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS initiated_by text NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS late_cancellation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

ALTER TABLE public.booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_status_check;
ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));

ALTER TABLE public.booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_recurrence_type_check;
ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_recurrence_type_check
  CHECK (recurrence_type IN ('once', 'weekly', 'biweekly', 'custom'));

ALTER TABLE public.booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_initiated_by_check;
ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_initiated_by_check
  CHECK (initiated_by IN ('student', 'tutor'));

CREATE INDEX IF NOT EXISTS booking_requests_tutor_status_idx
  ON public.booking_requests (tutor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_requests_student_status_idx
  ON public.booking_requests (student_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_requests_pending_expiry_idx
  ON public.booking_requests (expires_at)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS booking_requests_set_updated_at ON public.booking_requests;
CREATE TRIGGER booking_requests_set_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Calendar event shape updates
-- ---------------------------------------------------------------------------

ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS booking_request_id uuid REFERENCES public.booking_requests (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_type_check;
ALTER TABLE public.calendar_events
  ADD CONSTRAINT calendar_events_type_check
  CHECK (type IN (
    'available',
    'booked',
    'lesson',
    'blocked',
    'pending',
    'confirmed',
    'invite_pending'
  ));

CREATE INDEX IF NOT EXISTS calendar_events_booking_request_idx
  ON public.calendar_events (booking_request_id);

CREATE INDEX IF NOT EXISTS calendar_events_lock_lookup_idx
  ON public.calendar_events (tutor_id, start_time, end_time)
  WHERE type IN ('pending', 'confirmed', 'blocked', 'invite_pending');

CREATE UNIQUE INDEX IF NOT EXISTS calendar_events_tutor_exact_locked_uidx
  ON public.calendar_events (tutor_id, start_time, end_time)
  WHERE type IN ('pending', 'confirmed', 'blocked', 'invite_pending');

ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_tutor_locked_no_overlap;
ALTER TABLE public.calendar_events
  ADD CONSTRAINT calendar_events_tutor_locked_no_overlap
  EXCLUDE USING gist (
    tutor_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (type IN ('pending', 'confirmed', 'blocked', 'invite_pending'));

-- ---------------------------------------------------------------------------
-- Conversations/messages booking context
-- ---------------------------------------------------------------------------

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS booking_request_id uuid REFERENCES public.booking_requests (id) ON DELETE SET NULL;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS booking_request_id uuid REFERENCES public.booking_requests (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_booking_request_idx
  ON public.conversations (booking_request_id);
CREATE INDEX IF NOT EXISTS messages_booking_request_idx
  ON public.messages (booking_request_id);

-- ---------------------------------------------------------------------------
-- Booking audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.booking_request_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES public.booking_requests (id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_role text CHECK (actor_role IN ('student', 'tutor', 'system')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_request_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_request_audit_logs_select_parties
  ON public.booking_request_audit_logs;
CREATE POLICY booking_request_audit_logs_select_parties
  ON public.booking_request_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.booking_requests br
      WHERE br.id = booking_request_audit_logs.booking_request_id
        AND (auth.uid() = br.student_id OR auth.uid() = br.tutor_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Notifications: expand event types required by booking lifecycle
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'booking_request',
    'booking_accepted',
    'booking_declined',
    'booking_expired',
    'booking_cancelled',
    'booking_invite',
    'booking_invite_declined',
    'message',
    'review',
    'session_reminder'
  ));

-- ---------------------------------------------------------------------------
-- RLS policy tweak: tutor can initiate booking invite rows
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS booking_requests_student_insert ON public.booking_requests;
CREATE POLICY booking_requests_insert_parties
  ON public.booking_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = student_id AND initiated_by = 'student')
    OR (auth.uid() = tutor_id AND initiated_by = 'tutor')
  );

-- ---------------------------------------------------------------------------
-- Transactional slot booking RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_create_booking_request_atomic(
  p_tutor_id uuid,
  p_student_id uuid,
  p_requested_slots jsonb,
  p_recurrence_type text DEFAULT 'once',
  p_initiated_by text DEFAULT 'student',
  p_type text DEFAULT 'online',
  p_message text DEFAULT NULL,
  p_field_id uuid DEFAULT NULL,
  p_allow_partial boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot jsonb;
  v_slot_start timestamptz;
  v_slot_end timestamptz;
  v_locked_event_id uuid;
  v_booking_request_id uuid;
  v_created_event_ids uuid[] := '{}';
  v_effective_slots jsonb := '[]'::jsonb;
  v_conflicts jsonb := '[]'::jsonb;
  v_calendar_type text;
  v_actor_role text;
BEGIN
  IF p_requested_slots IS NULL OR jsonb_typeof(p_requested_slots) <> 'array' OR jsonb_array_length(p_requested_slots) = 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'INVALID_SLOTS',
      'message', 'requested_slots must be a non-empty array'
    );
  END IF;

  IF p_initiated_by NOT IN ('student', 'tutor') THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'INVALID_INITIATOR',
      'message', 'initiated_by must be student or tutor'
    );
  END IF;

  IF p_initiated_by = 'student' THEN
    IF auth.uid() IS DISTINCT FROM p_student_id THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error_code', 'NOT_AUTHORIZED',
        'message', 'Only the student can create this request'
      );
    END IF;
    v_calendar_type := 'pending';
    v_actor_role := 'student';
  ELSE
    IF auth.uid() IS DISTINCT FROM p_tutor_id THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error_code', 'NOT_AUTHORIZED',
        'message', 'Only the tutor can create invite requests'
      );
    END IF;
    v_calendar_type := 'invite_pending';
    v_actor_role := 'tutor';
  END IF;

  FOR v_slot IN SELECT value FROM jsonb_array_elements(p_requested_slots) AS value
  LOOP
    v_slot_start := NULLIF(v_slot->>'startTime', '')::timestamptz;
    v_slot_end := NULLIF(v_slot->>'endTime', '')::timestamptz;

    IF v_slot_start IS NULL OR v_slot_end IS NULL OR v_slot_end <= v_slot_start THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error_code', 'INVALID_SLOT_RANGE',
        'message', 'Each slot must have valid startTime and endTime'
      );
    END IF;

    SELECT ce.id
    INTO v_locked_event_id
    FROM public.calendar_events ce
    WHERE ce.tutor_id = p_tutor_id
      AND ce.type IN ('pending', 'confirmed', 'blocked', 'invite_pending')
      AND tstzrange(ce.start_time, ce.end_time, '[)') && tstzrange(v_slot_start, v_slot_end, '[)')
    ORDER BY ce.start_time
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF v_locked_event_id IS NOT NULL THEN
      v_conflicts := v_conflicts || jsonb_build_array(
        jsonb_build_object(
          'calendar_event_id', v_locked_event_id,
          'startTime', v_slot_start,
          'endTime', v_slot_end
        )
      );
    ELSE
      v_effective_slots := v_effective_slots || jsonb_build_array(
        jsonb_build_object('startTime', v_slot_start, 'endTime', v_slot_end)
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_conflicts) > 0 AND NOT p_allow_partial THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'SLOT_CONFLICT',
      'message', 'One or more requested slots are no longer available',
      'conflicts', v_conflicts
    );
  END IF;

  IF jsonb_array_length(v_effective_slots) = 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'SLOT_CONFLICT',
      'message', 'No available slots remain after conflict checks',
      'conflicts', v_conflicts
    );
  END IF;

  INSERT INTO public.booking_requests (
    tutor_id,
    student_id,
    requested_slots,
    recurrence_type,
    initiated_by,
    type,
    message,
    field_id,
    status,
    expires_at
  )
  VALUES (
    p_tutor_id,
    p_student_id,
    v_effective_slots,
    p_recurrence_type,
    p_initiated_by,
    p_type,
    p_message,
    p_field_id,
    'pending',
    now() + interval '48 hours'
  )
  RETURNING id INTO v_booking_request_id;

  FOR v_slot IN SELECT value FROM jsonb_array_elements(v_effective_slots) AS value
  LOOP
    v_slot_start := (v_slot->>'startTime')::timestamptz;
    v_slot_end := (v_slot->>'endTime')::timestamptz;

    INSERT INTO public.calendar_events (
      tutor_id,
      student_id,
      booking_request_id,
      title,
      description,
      start_time,
      end_time,
      type,
      color
    )
    VALUES (
      p_tutor_id,
      p_student_id,
      v_booking_request_id,
      CASE
        WHEN v_calendar_type = 'pending' THEN 'Booking request'
        ELSE 'Tutor invite'
      END,
      p_message,
      v_slot_start,
      v_slot_end,
      v_calendar_type,
      CASE
        WHEN v_calendar_type = 'pending' THEN '#f59e0b'
        ELSE '#f97316'
      END
    )
    RETURNING id INTO v_locked_event_id;

    v_created_event_ids := array_append(v_created_event_ids, v_locked_event_id);
  END LOOP;

  INSERT INTO public.booking_request_audit_logs (
    booking_request_id,
    from_status,
    to_status,
    actor_id,
    actor_role,
    metadata
  )
  VALUES (
    v_booking_request_id,
    NULL,
    'pending',
    auth.uid(),
    v_actor_role,
    jsonb_build_object('created_event_ids', v_created_event_ids, 'conflicts', v_conflicts)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'booking_request_id', v_booking_request_id,
    'created_event_ids', to_jsonb(v_created_event_ids),
    'conflicts', v_conflicts
  );
EXCEPTION
  WHEN exclusion_violation OR unique_violation THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'SLOT_CONFLICT',
      'message', 'A slot was booked concurrently. Please retry.',
      'conflicts', v_conflicts
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_create_booking_request_atomic(
  uuid,
  uuid,
  jsonb,
  text,
  text,
  text,
  text,
  uuid,
  boolean
) TO authenticated;

-- ---------------------------------------------------------------------------
-- Helper RPC: state transition + audit log
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_update_booking_request_status(
  p_booking_request_id uuid,
  p_next_status text,
  p_actor_id uuid,
  p_actor_role text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.booking_requests%ROWTYPE;
BEGIN
  SELECT *
  INTO v_booking
  FROM public.booking_requests
  WHERE id = p_booking_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'NOT_FOUND');
  END IF;

  UPDATE public.booking_requests
  SET status = p_next_status,
      updated_at = now()
  WHERE id = p_booking_request_id;

  INSERT INTO public.booking_request_audit_logs (
    booking_request_id,
    from_status,
    to_status,
    actor_id,
    actor_role,
    metadata
  )
  VALUES (
    p_booking_request_id,
    v_booking.status,
    p_next_status,
    p_actor_id,
    p_actor_role,
    coalesce(p_metadata, '{}'::jsonb)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_update_booking_request_status(
  uuid,
  text,
  uuid,
  text,
  jsonb
) TO authenticated;

