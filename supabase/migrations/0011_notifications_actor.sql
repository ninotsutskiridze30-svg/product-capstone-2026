-- Notifications: record WHO triggered each notification (the "actor").
--
-- Adds notifications.actor_id -> profiles(id). Used by the bell UI to show the
-- sender's name + avatar and to group multiple events from the same person.
-- Nullable: system-generated notifications (e.g. AI review) have no actor.
-- ON DELETE SET NULL so deleting a profile never cascades into the recipient's
-- notification history.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

-- Backfill existing 'message' notifications from the conversation's other party
-- (1:1 conversations, so the non-recipient party is the sender).
UPDATE public.notifications n
SET actor_id = CASE
  WHEN c.tutor_id = n.user_id THEN c.student_id
  ELSE c.tutor_id
END
FROM public.conversations c
WHERE n.actor_id IS NULL
  AND n.type = 'message'
  AND (n.payload ->> 'conversationId') IS NOT NULL
  AND (n.payload ->> 'conversationId')::uuid = c.id;
