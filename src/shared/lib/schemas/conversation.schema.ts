import { z } from "zod";

export const conversationCreateSchema = z.object({
  tutorId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
