import { z } from "zod";

export const groupCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  fieldId: z.string().uuid(),
  maxStudents: z.coerce.number().int().min(2).max(100),
  description: z.string().trim().max(2000).nullable().optional(),
  tutorId: z.string().uuid(),
});

export const groupUpdateSchema = groupCreateSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const groupMemberSchema = z.object({
  studentId: z.string().uuid(),
});

export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
export type GroupMemberInput = z.infer<typeof groupMemberSchema>;
