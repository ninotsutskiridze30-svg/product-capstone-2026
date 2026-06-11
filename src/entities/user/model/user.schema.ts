import { z } from "zod";

export const UserRoleSchema = z.enum(["tutor", "student"]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable().optional(),
  role: UserRoleSchema.nullable(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
