-- Live 1:1 video calls between connected tutors and students, plus saved
-- whiteboard snapshots that surface as attachments inside the existing chat.

-- Call sessions live alongside conversations. status is a plain text discriminator
-- to avoid an extra enum migration; CHECK keeps the values constrained.
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  initiated_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  livekit_room text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ringing'
    CHECK (status IN ('ringing', 'active', 'ended', 'declined', 'missed')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_sessions_conversation_idx
  ON public.call_sessions (conversation_id);
CREATE INDEX IF NOT EXISTS call_sessions_status_created_idx
  ON public.call_sessions (status, created_at DESC);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS call_sessions_select_parties ON public.call_sessions;
CREATE POLICY call_sessions_select_parties
  ON public.call_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = call_sessions.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

DROP POLICY IF EXISTS call_sessions_insert_parties ON public.call_sessions;
CREATE POLICY call_sessions_insert_parties
  ON public.call_sessions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

DROP POLICY IF EXISTS call_sessions_update_parties ON public.call_sessions;
CREATE POLICY call_sessions_update_parties
  ON public.call_sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = call_sessions.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = call_sessions.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

-- Saved whiteboard snapshots. We keep both a PNG (cheap to thumbnail) and the
-- raw tldraw JSON snapshot (re-openable in a viewer later if we want).
CREATE TABLE IF NOT EXISTS public.whiteboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id uuid REFERENCES public.call_sessions (id) ON DELETE SET NULL,
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  saved_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  image_path text NOT NULL,
  snapshot_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whiteboard_snapshots_conversation_idx
  ON public.whiteboard_snapshots (conversation_id, created_at DESC);

ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS whiteboard_snapshots_select_parties ON public.whiteboard_snapshots;
CREATE POLICY whiteboard_snapshots_select_parties
  ON public.whiteboard_snapshots FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = whiteboard_snapshots.conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

DROP POLICY IF EXISTS whiteboard_snapshots_insert_parties ON public.whiteboard_snapshots;
CREATE POLICY whiteboard_snapshots_insert_parties
  ON public.whiteboard_snapshots FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = saved_by
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

-- Surface saved boards inline in the existing chat. The chat panel already
-- renders messages over realtime; adding columns keeps a single timeline.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_type text,
  ADD COLUMN IF NOT EXISTS attachment_ref uuid;

-- Private storage bucket for saved whiteboards. Path scheme:
--   {conversation_id}/{snapshot_id}.png
--   {conversation_id}/{snapshot_id}.json
-- Server-side uploads use the service-role key (see /api/whiteboard-snapshots),
-- so storage RLS only needs to gate user-initiated reads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('whiteboard-snapshots', 'whiteboard-snapshots', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS whiteboard_snapshots_storage_select ON storage.objects;
CREATE POLICY whiteboard_snapshots_storage_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'whiteboard-snapshots'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(storage.objects.name, '/', 1)
        AND (auth.uid() = c.tutor_id OR auth.uid() = c.student_id)
    )
  );

-- Realtime: deliver call_sessions changes so the incoming-call banner sees rings.
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;
