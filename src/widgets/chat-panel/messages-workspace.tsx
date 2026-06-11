"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useActiveCallsByConversation } from "@/entities/call/api/active-calls.query";
import { callApi } from "@/entities/call/api/call.api";
import {
  messageKeys,
  useConversations,
  useMessages,
  useSendMessage,
} from "@/entities/message/api/message.query";
import { useRouter } from "@/shared/i18n/navigation";
import { useConversationMessagesChannel } from "@/shared/hooks/useRealtime";
import type { Database } from "@/shared/types/database.types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { WhiteboardAttachment } from "@/widgets/whiteboard/whiteboard-attachment";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

type Conv = ConversationRow & {
  peerName: string;
  peerId: string;
};

type Props = {
  userId: string;
  role: "tutor" | "student";
  /** Open this thread on load (e.g. after requesting a tutor). */
  initialConversationId?: string;
};

export function MessagesWorkspace({
  userId,
  role,
  initialConversationId,
}: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("call");
  const [activeId, setActiveId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [text, setText] = useState("");
  const [callStarting, setCallStarting] = useState(false);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToLatestRef = useRef(false);
  const shouldOpenAtBottomRef = useRef(true);

  const { data: convData, isLoading: convLoading, isError: convError } =
    useConversations();
  const { data: msgData, isFetching: messagesFetching } = useMessages(
    activeId ?? ""
  );
  const sendMutation = useSendMessage(userId);
  const activeCalls = useActiveCallsByConversation();
  const activeCallForThread = activeId ? activeCalls.get(activeId) ?? null : null;
  // "Join" only makes sense if the call was started by the other party — if I
  // initiated it I'm already in the room (or my caller-side ring timed out).
  const canJoinExisting =
    activeCallForThread !== null && activeCallForThread.initiatedBy !== userId;

  const conversations: Conv[] = useMemo(() => {
    const list = convData?.conversations ?? [];
    return list.map((conversation) => ({
      id: conversation.id,
      tutor_id: conversation.tutor_id,
      student_id: conversation.student_id,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at,
      booking_request_id: null,
      peerId:
        role === "tutor" ? conversation.student_id : conversation.tutor_id,
      peerName: conversation.peer_name,
    }));
  }, [convData?.conversations, role]);

  const messages = useMemo(
    () => (msgData?.messages ?? []) as MessageRow[],
    [msgData?.messages]
  );

  useEffect(() => {
    if (convError) {
      toast.error("Failed to load chats");
    }
  }, [convError]);

  const onRealtimeInsert = useCallback(
    (row: MessageRow) => {
      queryClient.setQueryData<{ messages: MessageRow[] }>(
        messageKeys.conversation(row.conversation_id),
        (old) => {
          const list = (old?.messages ?? []) as MessageRow[];
          if (list.some((message) => message.id === row.id)) {
            return old ?? { messages: [] };
          }

          const realtimeCreatedAt = new Date(row.created_at).getTime();
          const optimisticMatch = list.find(
            (message) =>
              message.id.startsWith("temp-") &&
              message.sender_id === row.sender_id &&
              message.content === row.content &&
              Math.abs(new Date(message.created_at).getTime() - realtimeCreatedAt) <
                15000
          );

          if (!optimisticMatch) {
            return { messages: [...list, row] };
          }

          return {
            messages: list.map((message) =>
              message.id === optimisticMatch.id ? row : message
            ),
          };
        }
      );
      // Keep the sidebar ordering / last-message in sync (conversations are not
      // streamed over Realtime, so refresh the list when a thread receives one).
      void queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
    [queryClient]
  );

  useConversationMessagesChannel(activeId, onRealtimeInsert);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomAnchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    // New thread selections should open from the latest message after load.
    shouldOpenAtBottomRef.current = true;
  }, [activeId]);

  useEffect(() => {
    if (shouldOpenAtBottomRef.current && !messagesFetching) {
      scrollToBottom("auto");
      shouldOpenAtBottomRef.current = false;
      return;
    }

    if (!shouldScrollToLatestRef.current) return;
    scrollToBottom("smooth");
    shouldScrollToLatestRef.current = false;
  }, [messages.length, messagesFetching, scrollToBottom]);

  async function startOrJoinCall() {
    if (!activeId || callStarting) return;
    // If a call is already ringing/active in this thread and the other party
    // started it, jump straight in rather than creating a duplicate session.
    if (canJoinExisting && activeCallForThread) {
      router.push(`/call/${activeCallForThread.callId}`);
      return;
    }
    setCallStarting(true);
    try {
      const { call } = await callApi.startCall({ conversationId: activeId });
      router.push(`/call/${call.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("startCallFailed"));
    } finally {
      setCallStarting(false);
    }
  }

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  async function send() {
    if (!activeId || !text.trim()) return;
    const content = text.trim();
    setText("");
    shouldScrollToLatestRef.current = true;
    try {
      await sendMutation.mutateAsync({
        conversationId: activeId,
        content,
      });
    } catch {
      shouldScrollToLatestRef.current = false;
      setText(content);
      toast.error("Failed to send message");
    }
  }

  if (convLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div className="border-border bg-background grid h-[calc(100vh-220px)] min-h-[480px] w-full gap-0 overflow-hidden rounded-xl border md:grid-cols-[260px_1fr]">
      <ScrollArea className="h-full min-h-0 border-r border-border bg-muted/30 p-3">
        <div className="space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={cn(
                "hover:bg-muted/70 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeId === c.id && "bg-surface border-border border font-medium"
              )}
            >
              {c.peerName}
            </button>
          ))}
          {conversations.length === 0 ? (
            <p className="text-muted-foreground p-2 text-xs">No conversations yet.</p>
          ) : null}
        </div>
      </ScrollArea>
      <div className="flex h-full min-h-0 flex-col">
        {activeConversation ? (
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
            <p className="truncate text-sm font-medium">
              {activeConversation.peerName}
            </p>
            <Button
              type="button"
              size="sm"
              variant={canJoinExisting ? "default" : "outline"}
              onClick={() => void startOrJoinCall()}
              disabled={callStarting}
              aria-label={canJoinExisting ? t("joinCall") : t("startCall")}
            >
              {canJoinExisting ? (
                <span className="relative mr-1 flex h-2 w-2" aria-hidden>
                  <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
                </span>
              ) : null}
              <Phone size={16} />
              <span className="ml-1.5 hidden md:inline">
                {canJoinExisting ? t("joinCall") : t("startCall")}
              </span>
            </Button>
          </div>
        ) : null}
        <ScrollArea className="min-h-0 flex-1 px-3 py-4 md:px-4">
          <div className="space-y-2.5">
            {activeId && messagesFetching && messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Loading messages…</p>
            ) : null}
            {messages.map((m) => {
              const isWhiteboard =
                m.attachment_type === "whiteboard" && m.attachment_ref;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-xl border border-border px-3.5 py-2.5 text-sm shadow-sm",
                    m.sender_id === userId ? "ml-auto bg-primary/10" : "mr-auto bg-surface"
                  )}
                >
                  {isWhiteboard ? (
                    <WhiteboardAttachment snapshotId={m.attachment_ref as string} />
                  ) : (
                    <p>{m.content}</p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {format(new Date(m.created_at), "PPp", { locale: enUS })}
                  </p>
                </div>
              );
            })}
            <div ref={bottomAnchorRef} />
          </div>
        </ScrollArea>
        <div className="border-border bg-surface border-t p-3 md:p-4">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button
              type="button"
              onClick={() => void send()}
              disabled={sendMutation.isPending}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
