import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MessagingState {
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;
  typingUsers: Record<string, string[]>;
}

interface MessagingStore extends MessagingState {
  setActiveConversation: (id: string | null) => void;
  setUnreadCount: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  resetMessaging: () => void;
}

const initialState: MessagingState = {
  activeConversationId: null,
  unreadCounts: {},
  typingUsers: {},
};

export const useMessagingStore = create<MessagingStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      setUnreadCount: (conversationId, count) =>
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [conversationId]: count },
        })),
      incrementUnread: (conversationId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
          },
        })),
      clearUnread: (conversationId) =>
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
        })),
      setTyping: (conversationId, userId, isTyping) =>
        set((state) => {
          const current = state.typingUsers[conversationId] ?? [];
          const updated = isTyping
            ? [...new Set([...current, userId])]
            : current.filter((id) => id !== userId);
          return {
            typingUsers: { ...state.typingUsers, [conversationId]: updated },
          };
        }),
      resetMessaging: () => set(initialState),
    }),
    {
      name: "messaging-store",
      enabled:
        process.env.NODE_ENV !== "production" && typeof window !== "undefined",
    }
  )
);
