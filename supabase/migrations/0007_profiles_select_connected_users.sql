-- Allow users to read profile names of people they are connected with.
-- This powers tutor/student selectors while still keeping profile access scoped.
DROP POLICY IF EXISTS profiles_select_connected_users ON public.profiles;
CREATE POLICY profiles_select_connected_users
  ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.connections c
      WHERE (
        c.student_id = auth.uid()
        AND c.tutor_id = profiles.id
      ) OR (
        c.tutor_id = auth.uid()
        AND c.student_id = profiles.id
      )
    )
  );
