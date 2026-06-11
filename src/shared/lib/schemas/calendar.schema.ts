import { z } from "zod";

/** `YYYY-MM-DD` for Postgres `date` / `<input type="date" />`; null clears. */
const recurrenceDateYmd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "recurrenceUntil must be YYYY-MM-DD")
  .nullable();

export const calendarEventCreateSchema = z.object({
  tutorId: z.string().uuid(),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(["available", "booked", "blocked", "lesson"]),
  color: z.string().trim().max(20).nullable().optional(),
  recurrenceType: z.enum(["none", "daily", "weekly"]).default("none"),
  recurrenceUntil: recurrenceDateYmd.optional(),
});

export const calendarEventPatchSchema = calendarEventCreateSchema
  .omit({ tutorId: true })
  .partial()
  .extend({
    tutorId: z.string().uuid(),
  });

export type CalendarEventCreateInput = z.infer<typeof calendarEventCreateSchema>;
export type CalendarEventPatchInput = z.infer<typeof calendarEventPatchSchema>;
