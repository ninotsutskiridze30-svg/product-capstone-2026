-- Student accept/decline for tutor-initiated lesson invites (atomic updates).

CREATE OR REPLACE FUNCTION public.rpc_accept_tutor_lesson_invite(
  p_booking_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.booking_requests%ROWTYPE;
  v_calendar_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'UNAUTHORIZED');
  END IF;

  SELECT *
  INTO v_req
  FROM public.booking_requests
  WHERE id = p_booking_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'NOT_FOUND');
  END IF;

  IF v_req.student_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'FORBIDDEN');
  END IF;

  IF v_req.initiated_by IS DISTINCT FROM 'tutor' OR v_req.status IS DISTINCT FROM 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'INVALID_STATE');
  END IF;

  UPDATE public.booking_requests
  SET status = 'accepted',
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
    'pending',
    'accepted',
    auth.uid(),
    'student',
    '{}'::jsonb
  );

  UPDATE public.calendar_events
  SET type = 'lesson',
      color = coalesce(nullif(trim(color), ''), '#3b82f6')
  WHERE booking_request_id = p_booking_request_id
    AND type = 'invite_pending';

  SELECT id
  INTO v_calendar_id
  FROM public.calendar_events
  WHERE booking_request_id = p_booking_request_id
  ORDER BY start_time
  LIMIT 1;

  INSERT INTO public.lesson_sessions (
    tutor_id,
    student_id,
    calendar_event_id,
    field_id,
    type,
    status,
    price,
    currency
  )
  VALUES (
    v_req.tutor_id,
    v_req.student_id,
    v_calendar_id,
    v_req.field_id,
    v_req.type,
    'confirmed',
    null,
    'USD'
  );

  RETURN jsonb_build_object('ok', true, 'calendar_event_id', v_calendar_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_decline_tutor_lesson_invite(
  p_booking_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.booking_requests%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'UNAUTHORIZED');
  END IF;

  SELECT *
  INTO v_req
  FROM public.booking_requests
  WHERE id = p_booking_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'NOT_FOUND');
  END IF;

  IF v_req.student_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'FORBIDDEN');
  END IF;

  IF v_req.initiated_by IS DISTINCT FROM 'tutor' OR v_req.status IS DISTINCT FROM 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'INVALID_STATE');
  END IF;

  UPDATE public.booking_requests
  SET status = 'declined',
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
    'pending',
    'declined',
    auth.uid(),
    'student',
    '{}'::jsonb
  );

  DELETE FROM public.calendar_events
  WHERE booking_request_id = p_booking_request_id
    AND type = 'invite_pending';

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_accept_tutor_lesson_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_decline_tutor_lesson_invite(uuid) TO authenticated;
