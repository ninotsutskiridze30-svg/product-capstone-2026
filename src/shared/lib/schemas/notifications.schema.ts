import { z } from "zod";

export const notificationsPatchSchema = z.union([
  z.object({
    ids: z.array(z.string().uuid()).min(1),
  }),
  z.object({
    all: z.literal(true),
  }),
]);

export type NotificationsPatchInput = z.infer<typeof notificationsPatchSchema>;
