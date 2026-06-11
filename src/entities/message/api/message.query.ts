import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { ConversationCreateInput } from "./message.api";
import { messageApi } from "./message.api";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
};

/**
 * Safety-net polling interval. Realtime is the instant path; if the websocket
 * silently drops or is misconfigured, polling still converges chat within ~10s.
 * `refetchIntervalInBackground: false` pauses it while the tab is hidden, so the
 * cost is bounded to the actively-open conversation of a focused tab.
 */
const CHAT_POLL_MS = 10_000;

export const conversationsQueryOptions = () =>
  queryOptions({
    queryKey: messageKeys.conversations(),
    queryFn: () => messageApi.getConversations(),
    refetchInterval: CHAT_POLL_MS,
    refetchIntervalInBackground: false,
  });

export const messagesQueryOptions = (conversationId: string) =>
  queryOptions({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: () => messageApi.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: conversationId ? CHAT_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

export const useConversations = () => useQuery(conversationsQueryOptions());

export const useMessages = (conversationId: string) =>
  useQuery(messagesQueryOptions(conversationId));

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConversationCreateInput) => messageApi.createConversation(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

/** Pass current user id for correct optimistic message sender. */
export function useSendMessage(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messageApi.sendMessage,
    onMutate: async (newMsg) => {
      const key = messageKeys.conversation(newMsg.conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: { messages: unknown[] } | undefined) => ({
        messages: [
          ...(old?.messages ?? []),
          {
            id: `temp-${crypto.randomUUID()}`,
            conversation_id: newMsg.conversationId,
            sender_id: userId,
            content: newMsg.content,
            attachment_type: null,
            attachment_ref: null,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return { prev, key };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev && ctx.key) {
        queryClient.setQueryData(ctx.key, ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

/** Single-page until messages API supports cursor pagination. */
export function useMessagesInfinite(conversationId: string) {
  return useInfiniteQuery({
    queryKey: [...messageKeys.conversation(conversationId), "infinite"],
    queryFn: () => messageApi.getMessages(conversationId),
    getNextPageParam: () => undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}
