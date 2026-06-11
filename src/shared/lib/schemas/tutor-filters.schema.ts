import { z } from "zod";

export const tutorFiltersSchema = z.object({
  field: z.string().uuid().optional(),
  city: z.string().trim().min(1).max(120).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  language: z.string().trim().min(1).max(64).optional(),
  type: z.enum(["online", "onsite"]).optional(),
  date: z.string().date().optional(),
  q: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type TutorFiltersInput = z.infer<typeof tutorFiltersSchema>;
