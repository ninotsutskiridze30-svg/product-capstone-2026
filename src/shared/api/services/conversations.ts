import { parseIsoDate } from "@/shared/api/services/_shared";
import { fetchJson } from "@/shared/api/services/_shared";
import type { ConversationCreateInput } from "@/shared/lib/schemas/conversation.schema";

export type ConversationDto = {
  id: string;
  tutor_id: string;
  student_id: string;
  created_at: Date;
  last_message_at: Date | null;
  peer_name: string;
};

export type ConversationsResponse = {
  conversations: ConversationDto[];
};

function normalizeConversation(
  conversation: Omit<
    ConversationDto,
    "created_at" | "last_message_at"
  > & {
    created_at: string;
    last_message_at: string | null;
  }
): ConversationDto {
  return {
    ...conversation,
    created_at: parseIsoDate(conversation.created_at),
    last_message_at: conversation.last_message_at
      ? parseIsoDate(conversation.last_message_at)
      : null,
  };
}

export async function getConversations(): Promise<ConversationsResponse> {
  const response = await fetchJson<{
    conversations: (Omit<
      ConversationDto,
      "created_at" | "last_message_at"
    > & {
      created_at: string;
      last_message_at: string | null;
    })[];
  }>("/api/conversations");

  return {
    conversations: response.conversations.map((conversation) =>
      normalizeConversation(conversation)
    ),
  };
}

export async function createOrGetConversation(input: ConversationCreateInput) {
  return fetchJson<{ conversation: ConversationDto }>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
