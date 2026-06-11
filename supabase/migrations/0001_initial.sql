-- TutorLink initial schema: tables, RLS, search index, auth profile hook, notification triggers
-- Storage buckets (create in Supabase Dashboard): avatars, covers, gallery, certificates — public read as needed, authenticated upload paths per app.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('tutor', 'student')),
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  city text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tutor_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  headline text,
  hourly_rate_min numeric,
  hourly_rate_max numeric,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  experience_years int,
  education jsonb NOT NULL DEFAULT '[]',
  certifications jsonb NOT NULL DEFAULT '[]',
  languages text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  response_time_hours int,
  website_url text,
  linkedin_url text,
  search_document text NOT NULL DEFAULT '',
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(search_document, ''))) STORED
);

CREATE INDEX tutor_profiles_search_vector_idx ON public.tutor_profiles USING gin (search_vector);

CREATE TABLE public.field_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text
);

CREATE TABLE public.fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.field_categories (id) ON DELETE RESTRICT,
  icon text,
  is_predefined boolean NOT NULL DEFAULT true
);

CREATE TABLE public.tutor_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.fields (id) ON DELETE CASCADE,
  custom_field_name text,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience int
);

CREATE TABLE public.tutor_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('cover', 'gallery', 'certificate')),
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  title text,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('available', 'booked', 'blocked', 'lesson')),
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule jsonb,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  field_id uuid NOT NULL REFERENCES public.fields (id) ON DELETE RESTRICT,
  max_students int NOT NULL,
  current_count int NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.student_groups (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('active', 'dropped', 'completed'))
);

CREATE UNIQUE INDEX group_members_group_student_uidx ON public.group_members (group_id, student_id);

CREATE TABLE public.lesson_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid REFERENCES public.calendar_events (id) ON DELETE SET NULL,
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.student_groups (id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  field_id uuid REFERENCES public.fields (id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('online', 'onsite')),
  location text,
  price numeric,
  currency varchar(3),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  meeting_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  calendar_event_id uuid REFERENCES public.calendar_events (id) ON DELETE SET NULL,
  proposed_start timestamptz,
  proposed_end timestamptz,
  message text,
  field_id uuid REFERENCES public.fields (id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('online', 'onsite')),
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, student_id)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.lesson_sessions (id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'booking_request', 'message', 'review',
    'session_reminder', 'booking_accepted', 'booking_declined'
  )),
  title text NOT NULL,
  body text,
  payload jsonb NOT NULL DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_created_idx ON public.notifications (user_id, created_at DESC);

CREATE TABLE public.tutor_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, tutor_id)
);

CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  email_booking boolean NOT NULL DEFAULT true,
  email_message boolean NOT NULL DEFAULT true,
  push_booking boolean NOT NULL DEFAULT true,
  push_message boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- updated_at touch
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Full-text search document refresh (denormalized + generated tsvector column)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.refresh_tutor_search_document(p_tutor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc text;
  v_headline text;
  v_name text;
BEGIN
  SELECT p.full_name, tp.headline
  INTO v_name, v_headline
  FROM public.profiles p
  JOIN public.tutor_profiles tp ON tp.id = p.id
  WHERE tp.id = p_tutor_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT trim(
    both ' '
    FROM concat_ws(
      ' ',
      coalesce(v_name, ''),
      coalesce(v_headline, ''),
      coalesce(
        (
          SELECT string_agg(DISTINCT coalesce(f.name, tf.custom_field_name, ''), ' ')
          FROM public.tutor_fields tf
          LEFT JOIN public.fields f ON f.id = tf.field_id
          WHERE tf.tutor_id = p_tutor_id
        ),
        ''
      )
    )
  )
  INTO doc;

  UPDATE public.tutor_profiles
  SET search_document = coalesce(nullif(doc, ''), '')
  WHERE id = p_tutor_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_search_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.tutor_profiles WHERE id = NEW.id) THEN
    PERFORM public.refresh_tutor_search_document(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_refresh_tutor_search
  AFTER INSERT OR UPDATE OF full_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_search_from_profile();

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_search_from_tutor_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_tutor_search_document(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tutor_profiles_refresh_search
  AFTER INSERT OR UPDATE OF headline ON public.tutor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_search_from_tutor_profile();

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_search_from_tutor_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_tutor_search_document(OLD.tutor_id);
    RETURN OLD;
  END IF;
  PERFORM public.refresh_tutor_search_document(NEW.tutor_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tutor_fields_refresh_search
  AFTER INSERT OR UPDATE OR DELETE ON public.tutor_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_search_from_tutor_fields();

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_search_from_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.name IS NOT DISTINCT FROM OLD.name THEN
    RETURN NEW;
  END IF;
  PERFORM public.refresh_tutor_search_document(tf.tutor_id)
  FROM public.tutor_fields tf
  WHERE tf.field_id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER fields_refresh_tutor_search
  AFTER UPDATE OF name ON public.fields
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_search_from_fields();

-- ---------------------------------------------------------------------------
-- Auth: create profile row on signup (default student; app promotes to tutor)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'student',
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Notification helpers (SECURITY DEFINER)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_payload jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, payload)
  VALUES (p_user_id, p_type, p_title, p_body, coalesce(p_payload, '{}'));
END;
$$;

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
    jsonb_build_object('booking_request_id', NEW.id, 'student_id', NEW.student_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_requests_notify_tutor
  AFTER INSERT ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_booking_request();

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
      jsonb_build_object('booking_request_id', NEW.id, 'tutor_id', NEW.tutor_id)
    );
  ELSIF NEW.status = 'declined' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.notify_user(
      NEW.student_id,
      'booking_declined',
      'Booking declined',
      'Your tutor declined the booking request.',
      jsonb_build_object('booking_request_id', NEW.id, 'tutor_id', NEW.tutor_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_requests_status_notify_student
  AFTER UPDATE OF status ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_booking_status();

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
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_notify_recipient
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_new_message();

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
    jsonb_build_object('review_id', NEW.id, 'session_id', NEW.session_id, 'student_id', NEW.student_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_notify_tutor
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_new_review();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_public_tutors"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (
    role = 'tutor'
    AND EXISTS (
      SELECT 1 FROM public.tutor_profiles tp
      WHERE tp.id = profiles.id AND tp.is_active = true
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- tutor_profiles
CREATE POLICY "tutor_profiles_public_read_active"
  ON public.tutor_profiles FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "tutor_profiles_owner_all"
  ON public.tutor_profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- categories & fields (read-only public)
CREATE POLICY "field_categories_read_all"
  ON public.field_categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "fields_read_all"
  ON public.fields FOR SELECT TO anon, authenticated
  USING (true);

-- tutor_fields
CREATE POLICY "tutor_fields_public_read"
  ON public.tutor_fields FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_profiles tp
      WHERE tp.id = tutor_fields.tutor_id AND tp.is_active = true
    )
  );

CREATE POLICY "tutor_fields_owner_write"
  ON public.tutor_fields FOR ALL TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- tutor_images
CREATE POLICY "tutor_images_public_read"
  ON public.tutor_images FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_profiles tp
      WHERE tp.id = tutor_images.tutor_id AND tp.is_active = true
    )
  );

CREATE POLICY "tutor_images_owner_write"
  ON public.tutor_images FOR ALL TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- calendar_events (public sees schedule for active tutors)
CREATE POLICY "calendar_events_public_read"
  ON public.calendar_events FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_profiles tp
      WHERE tp.id = calendar_events.tutor_id AND tp.is_active = true
    )
  );

CREATE POLICY "calendar_events_owner_write"
  ON public.calendar_events FOR ALL TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- student_groups
CREATE POLICY "student_groups_public_read_active"
  ON public.student_groups FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "student_groups_tutor_write"
  ON public.student_groups FOR ALL TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- group_members
CREATE POLICY "group_members_select_participants"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.student_groups g
      WHERE g.id = group_members.group_id AND g.tutor_id = auth.uid()
    )
  );

CREATE POLICY "group_members_student_insert_self"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "group_members_tutor_insert"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_groups g
      WHERE g.id = group_id AND g.tutor_id = auth.uid()
    )
  );

CREATE POLICY "group_members_student_update_self"
  ON public.group_members FOR UPDATE TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "group_members_tutor_manage"
  ON public.group_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_groups g
      WHERE g.id = group_members.group_id AND g.tutor_id = auth.uid()
    )
  );

-- lesson_sessions
CREATE POLICY "lesson_sessions_participant_select"
  ON public.lesson_sessions FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR auth.uid() = tutor_id
  );

CREATE POLICY "lesson_sessions_tutor_insert"
  ON public.lesson_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "lesson_sessions_participant_update"
  ON public.lesson_sessions FOR UPDATE TO authenticated
  USING (
    auth.uid() = student_id OR auth.uid() = tutor_id
  )
  WITH CHECK (
    auth.uid() = student_id OR auth.uid() = tutor_id
  );

-- booking_requests
CREATE POLICY "booking_requests_select_parties"
  ON public.booking_requests FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "booking_requests_student_insert"
  ON public.booking_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "booking_requests_update_parties"
  ON public.booking_requests FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = tutor_id);

-- conversations
CREATE POLICY "conversations_select_parties"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "conversations_insert_parties"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "conversations_update_parties"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id)
  WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id);

-- messages
CREATE POLICY "messages_select_conversation"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

CREATE POLICY "messages_update_own_read"
  ON public.messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

-- reviews
CREATE POLICY "reviews_public_read_visible"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (
    is_visible = true
    AND EXISTS (SELECT 1 FROM public.tutor_profiles tp WHERE tp.id = reviews.tutor_id AND tp.is_active = true)
  );

CREATE POLICY "reviews_student_write_own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "reviews_student_update_own"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tutor_favorites
CREATE POLICY "tutor_favorites_select_own"
  ON public.tutor_favorites FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "tutor_favorites_write_own"
  ON public.tutor_favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "tutor_favorites_delete_own"
  ON public.tutor_favorites FOR DELETE TO authenticated
  USING (auth.uid() = student_id);

-- notification_preferences
CREATE POLICY "notification_preferences_own"
  ON public.notification_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime: enable replication for messages & notifications (run in SQL or Dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Public tutor text search (RLS applies; invoker)
CREATE OR REPLACE FUNCTION public.search_active_tutors(p_query text)
RETURNS SETOF public.tutor_profiles
LANGUAGE sql
STABLE
AS $$
  SELECT tp.*
  FROM public.tutor_profiles tp
  WHERE tp.is_active = true
    AND (
      p_query IS NULL
      OR btrim(p_query) = ''
      OR tp.search_vector @@ plainto_tsquery('simple', p_query)
    );
$$;

GRANT EXECUTE ON FUNCTION public.search_active_tutors(text) TO anon, authenticated;
