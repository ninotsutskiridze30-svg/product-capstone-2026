-- Student-tutor connections become the source of truth for messaging and invites.

CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, tutor_id)
);

CREATE INDEX IF NOT EXISTS connections_student_idx ON public.connections(student_id);
CREATE INDEX IF NOT EXISTS connections_tutor_idx ON public.connections(tutor_id);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS connections_select_participants ON public.connections;
CREATE POLICY connections_select_participants
  ON public.connections
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

DROP POLICY IF EXISTS connections_insert_participants ON public.connections;
CREATE POLICY connections_insert_participants
  ON public.connections
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (auth.uid() = student_id OR auth.uid() = tutor_id)
  );
