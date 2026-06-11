import { parseIsoDate } from "@/shared/api/services/_shared";
import { fetchJson } from "@/shared/api/services/_shared";
import type { MessageCreateInput } from "@/shared/lib/schemas/message.schema";

export type MessageDto = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
};

export type MessagesResponse = {
  messages: MessageDto[];
};

function normalizeMessage(
  message: Omit<MessageDto, "created_at"> & { created_at: string }
) {
  return {
    ...message,
    created_at: parseIsoDate(message.created_at),
  };
}

export async function getMessages(
  conversationId: string
): Promise<MessagesResponse> {
  const response = await fetchJson<{
    messages: (Omit<MessageDto, "created_at"> & { created_at: string })[];
  }>(`/api/messages?conversationId=${conversationId}`);

  return { messages: response.messages.map((message) => normalizeMessage(message)) };
}

export async function sendMessage(input: MessageCreateInput) {
  return fetchJson<{ message: MessageDto }>("/api/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
