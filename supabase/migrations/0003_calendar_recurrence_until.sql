-- Inclusive last calendar day recurring occurrences may start (YYYY-MM-DD).
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS recurrence_until date;
