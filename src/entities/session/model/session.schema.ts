import { z } from "zod";

export const SessionStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const SessionSchema = z.object({
  id: z.string().uuid(),
  tutor_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: SessionStatusSchema,
  type: z.enum(["online", "onsite"]),
  created_at: z.string(),
  peerName: z.string().optional(),
});

export const BookingRequestSchema = z.object({
  id: z.string().uuid(),
  tutor_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: z.string(),
  type: z.enum(["online", "onsite"]),
  proposed_start: z.string().nullable(),
  proposed_end: z.string().nullable(),
  message: z.string().nullable(),
  initiated_by: z.enum(["tutor", "student"]),
  requested_slots: z.unknown(),
  peerName: z.string().optional(),
});

export const TutorBookingsDetailSchema = z.object({
  pending: z.array(BookingRequestSchema),
  upcoming: z.array(SessionSchema),
  past: z.array(SessionSchema),
  cancelled: z.array(SessionSchema),
});

export const StudentBookingsDetailSchema = z.object({
  pendingRequests: z.array(BookingRequestSchema),
  upcoming: z.array(SessionSchema),
  past: z.array(SessionSchema),
  reviewedSessionIds: z.array(z.string()),
});

export type Session = z.infer<typeof SessionSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type TutorBookingsDetail = z.infer<typeof TutorBookingsDetailSchema>;
export type StudentBookingsDetail = z.infer<typeof StudentBookingsDetailSchema>;
