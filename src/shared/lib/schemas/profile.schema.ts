import { z } from "zod";

export const profilePatchSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    bio: z.string().trim().max(5000).nullable().optional(),
    phone: z.string().trim().max(60).nullable().optional(),
    city: z.string().trim().max(120).nullable().optional(),
    country: z.string().trim().max(120).nullable().optional(),
    headline: z.string().trim().max(200).nullable().optional(),
    hourlyRateMin: z.coerce.number().min(0).nullable().optional(),
    hourlyRateMax: z.coerce.number().min(0).nullable().optional(),
    experienceYears: z.coerce.number().int().min(0).max(80).nullable().optional(),
    languages: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
    websiteUrl: z.string().url().nullable().optional(),
    linkedinUrl: z.string().url().nullable().optional(),
    education: z.unknown().optional(),
    certifications: z.unknown().optional(),
  })
  .refine(
    (value) =>
      value.hourlyRateMin == null ||
      value.hourlyRateMax == null ||
      value.hourlyRateMin <= value.hourlyRateMax,
    {
      path: ["hourlyRateMax"],
      message: "Maximum rate must be greater than or equal to minimum rate",
    }
  );

export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;
