import { z } from "zod";

export const tutorNotificationPrefsPatchSchema = z.object({
  emailBooking: z.boolean(),
  emailMessage: z.boolean(),
  pushBooking: z.boolean(),
  pushMessage: z.boolean(),
});

export type TutorNotificationPrefsPatchInput = z.infer<
  typeof tutorNotificationPrefsPatchSchema
>;
