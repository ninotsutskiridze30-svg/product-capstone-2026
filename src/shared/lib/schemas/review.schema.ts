import { z } from "zod";

export const reviewCreateSchema = z.object({
  sessionId: z.string().uuid(),
  tutorId: z.string().uuid(),
  tutorSlug: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().max(5000).nullable().optional(),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
