import { z } from "zod";

export const messageCreateSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().trim().min(1).max(5000),
});

export const messageListQuerySchema = z.object({
  conversationId: z.string().uuid(),
});

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
