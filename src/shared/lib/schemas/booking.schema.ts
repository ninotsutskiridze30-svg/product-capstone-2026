import { z } from "zod";

export const bookingCreateSchema = z.object({
  tutorId: z.string().uuid(),
  calendarEventId: z.string().uuid().nullable().optional(),
  proposedStart: z.string().datetime().nullable().optional(),
  proposedEnd: z.string().datetime().nullable().optional(),
  message: z.string().trim().max(2000).nullable().optional(),
  fieldId: z.string().uuid().nullable().optional(),
  type: z.enum(["online", "onsite"]),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

export const bookingCancelSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const tutorLessonInviteSchema = z
  .object({
    studentId: z.string().uuid(),
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    type: z.enum(["online", "onsite"]),
    fieldId: z.string().uuid().nullable().optional(),
    message: z.string().trim().max(2000).nullable().optional(),
    recurrenceWeekdays: z.array(z.number().int().min(0).max(6)).optional(),
    recurrenceUntilDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (new Date(value.endIso) <= new Date(value.startIso)) {
      ctx.addIssue({
        code: "custom",
        message: "End must be after start",
        path: ["endIso"],
      });
    }
    const hasWeekdays = (value.recurrenceWeekdays?.length ?? 0) > 0;
    const hasUntil = Boolean(value.recurrenceUntilDate);
    if (hasWeekdays !== hasUntil) {
      ctx.addIssue({
        code: "custom",
        message: "Recurring invites require weekdays and an end date",
        path: hasWeekdays ? ["recurrenceUntilDate"] : ["recurrenceWeekdays"],
      });
    }
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
export type BookingCancelInput = z.infer<typeof bookingCancelSchema>;
export type TutorLessonInviteInput = z.infer<typeof tutorLessonInviteSchema>;
