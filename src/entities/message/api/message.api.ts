import { fetchJson } from "@/shared/api/services/_shared";
import type { MessageCreateInput } from "../model/message.schema";

export type ConversationCreateInput = {
  tutorId: string;
  studentId: string;
};

export type ConversationMutationResponse = {
  conversation: {
    id: string;
    tutor_id: string;
    student_id: string;
    created_at: string;
    last_message_at: string | null;
  };
};

export const messageApi = {
  getConversations: async () => {
    return fetchJson<{
      conversations: Array<{
        id: string;
        tutor_id: string;
        student_id: string;
        created_at: string;
        last_message_at: string | null;
        peer_name: string;
      }>;
    }>("/api/conversations");
  },

  createConversation: async (input: ConversationCreateInput) => {
    return fetchJson<ConversationMutationResponse>("/api/conversations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getMessages: async (conversationId: string) => {
    return fetchJson<{
      messages: Array<{
        id: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        attachment_type: string | null;
        attachment_ref: string | null;
        is_read: boolean;
        created_at: string;
      }>;
    }>(`/api/messages?conversationId=${conversationId}`);
  },

  sendMessage: async (input: MessageCreateInput) => {
    return fetchJson<{ message: unknown }>("/api/messages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
