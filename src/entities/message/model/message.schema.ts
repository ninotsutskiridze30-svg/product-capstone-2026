import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  is_read: z.boolean(),
  created_at: z.union([z.string(), z.date()]),
});

export const ConversationSchema = z.object({
  id: z.string(),
  tutor_id: z.string(),
  student_id: z.string(),
  created_at: z.union([z.string(), z.date()]),
  last_message_at: z.union([z.string(), z.date()]).nullable(),
  peer_name: z.string(),
});

export const MessageCreateSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
});

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type MessageCreateInput = z.infer<typeof MessageCreateSchema>;
