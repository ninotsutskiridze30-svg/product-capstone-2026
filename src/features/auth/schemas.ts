import { z } from "zod";

type AuthTranslationFn = (
  key: string,
  values?: Record<string, string | number>
) => string;

export const createCredentialsRegisterSchema = (t: AuthTranslationFn) =>
  z
    .object({
      email: z.string().email(t("validationEmailRequired")),
      password: z.string().min(8, t("validationPasswordMin")),
      confirmPassword: z.string().min(1, t("validationConfirmPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validationPasswordsDontMatch"),
      path: ["confirmPassword"],
    });

const createTutorRegisterBaseSchema = (t: AuthTranslationFn) =>
  z.object({
    fullName: z.string().min(2, t("validationNameRequired")),
    headline: z.string().min(2, t("validationHeadlineRequired")),
    hourlyRateMin: z.number().positive(t("validationRequired")),
    hourlyRateMax: z.number().positive(t("validationRequired")),
    fieldIds: z.array(z.string().uuid()).min(1, t("validationPickSubject")),
    proficiencyLevel: z.enum([
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ]),
  });

export const createTutorRegisterDetailsSchema = (t: AuthTranslationFn) =>
  createTutorRegisterBaseSchema(t);

export const createStudentProfileCompleteSchema = (t: AuthTranslationFn) =>
  z.object({
    fullName: z.string().min(2, t("validationNameRequired")).trim(),
    phone: z.string().trim().max(50).optional(),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    bio: z.string().trim().max(2000).optional(),
  });

export const createLoginSchema = (t: AuthTranslationFn) =>
  z.object({
    email: z.string().email(t("validationEmailRequired")),
    password: z.string().min(1, t("validationPasswordRequired")),
  });

export type CredentialsRegisterValues = z.infer<
  ReturnType<typeof createCredentialsRegisterSchema>
>;
export type StudentProfileCompleteValues = z.infer<
  ReturnType<typeof createStudentProfileCompleteSchema>
>;
export type TutorRegisterDetailsValues = z.infer<
  ReturnType<typeof createTutorRegisterDetailsSchema>
>;
export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
