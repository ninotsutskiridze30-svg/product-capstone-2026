"use client";

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from "@supabase/supabase-js";
import { useEffect, useRef } from "react";

/** Live message delivery via Supabase Realtime (Postgres changes) — no separate socket server. */
import { createBrowserClient } from "@/shared/api/supabase-browser";
import type { Database } from "@/shared/types/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CallSessionRow = Database["public"]["Tables"]["call_sessions"]["Row"];

/** Realtime channel subscribe status values (from realtime-js). */
type SubscribeStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR";

const MAX_BACKOFF_MS = 15_000;

function backoffDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
}

/**
 * Ensure the Realtime socket carries the current user's JWT BEFORE we subscribe.
 *
 * Postgres-changes subscriptions are RLS-scoped: the server evaluates the table's
 * SELECT policy with whatever token the channel join carried. On a freshly loaded
 * page `socket.accessTokenValue` is null until an async auth handshake resolves, so
 * a synchronous `.subscribe()` can join as the anon role and RLS silently withholds
 * every row — the recipient then never receives INSERT events. Awaiting setAuth()
 * here populates the token so the join is authorized.
 */
async function ensureRealtimeAuth(supabase: SupabaseClient<Database>): Promise<void> {
  try {
    await supabase.auth.getSession(); // refreshes the session if it is stale
    await supabase.realtime.setAuth(); // callback path -> fills socket.accessTokenValue
  } catch {
    /* best-effort: subscribe will still attempt, and polling is the safety net */
  }
}

/** Keep the Realtime socket token in sync across token refreshes. Bound once per tab. */
let authRefreshBound = false;
function bindAuthRefresh(supabase: SupabaseClient<Database>): void {
  if (authRefreshBound) return;
  authRefreshBound = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      void supabase.realtime.setAuth();
    }
  });
}

export function useConversationMessagesChannel(
  conversationId: string | null,
  onInsert: (row: MessageRow) => void
) {
  // Ref keeps the latest callback without making it an effect dependency, so the
  // channel is not torn down / re-subscribed on every parent re-render.
  const onInsertRef = useRef(onInsert);
  useEffect(() => {
    onInsertRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createBrowserClient();
    bindAuthRefresh(supabase);

    let channel: RealtimeChannel | null = null;
    let disposed = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const subscribe = async () => {
      await ensureRealtimeAuth(supabase);
      if (disposed) return;

      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload: RealtimePostgresChangesPayload<MessageRow>) => {
            if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
              onInsertRef.current(payload.new as MessageRow);
            }
          }
        )
        .subscribe((status: SubscribeStatus, err?: Error) => {
          if (status === "SUBSCRIBED") {
            attempt = 0;
            return;
          }
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            if (disposed) return;
            if (err) {
              console.warn(`[realtime] messages:${conversationId} ${status}`, err.message);
            }
            const delay = backoffDelay(attempt);
            attempt += 1;
            if (channel) {
              void supabase.removeChannel(channel);
              channel = null;
            }
            retryTimer = setTimeout(() => void subscribe(), delay);
          }
        });
    };

    void subscribe();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [conversationId]);
}

export type CallSessionChange = {
  event: "INSERT" | "UPDATE";
  row: CallSessionRow;
};

type CallSessionListener = (change: CallSessionChange) => void;

type CallSessionsChannelEntry = {
  channel: RealtimeChannel | null;
  listeners: Set<CallSessionListener>;
  supabase: SupabaseClient<Database>;
  disposed: boolean;
  retryTimer?: ReturnType<typeof setTimeout>;
};

/** One Realtime channel per user; multiple hook instances share it. */
const callSessionsChannels = new Map<string, CallSessionsChannelEntry>();

function dispatchCallSessionChange(
  listeners: Set<CallSessionListener>,
  change: CallSessionChange
) {
  for (const listener of listeners) {
    listener(change);
  }
}

function subscribeCallSessionsChannel(
  userId: string,
  listener: CallSessionListener
): () => void {
  let entry = callSessionsChannels.get(userId);
  if (!entry) {
    const supabase = createBrowserClient();
    bindAuthRefresh(supabase);
    const newEntry: CallSessionsChannelEntry = {
      channel: null,
      listeners: new Set<CallSessionListener>(),
      supabase,
      disposed: false,
    };
    let attempt = 0;

    const connect = async () => {
      await ensureRealtimeAuth(supabase);
      if (newEntry.disposed) return;

      newEntry.channel = supabase
        .channel(`call-sessions:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "call_sessions" },
          (payload: RealtimePostgresChangesPayload<CallSessionRow>) => {
            if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
              dispatchCallSessionChange(newEntry.listeners, {
                event: "INSERT",
                row: payload.new as CallSessionRow,
              });
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "call_sessions" },
          (payload: RealtimePostgresChangesPayload<CallSessionRow>) => {
            if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
              dispatchCallSessionChange(newEntry.listeners, {
                event: "UPDATE",
                row: payload.new as CallSessionRow,
              });
            }
          }
        )
        .subscribe((status: SubscribeStatus, err?: Error) => {
          if (status === "SUBSCRIBED") {
            attempt = 0;
            return;
          }
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            if (newEntry.disposed) return;
            if (err) {
              console.warn(`[realtime] call-sessions:${userId} ${status}`, err.message);
            }
            const delay = backoffDelay(attempt);
            attempt += 1;
            if (newEntry.channel) {
              void supabase.removeChannel(newEntry.channel);
              newEntry.channel = null;
            }
            newEntry.retryTimer = setTimeout(() => void connect(), delay);
          }
        });
    };

    void connect();
    entry = newEntry;
    callSessionsChannels.set(userId, entry);
  }

  entry.listeners.add(listener);
  return () => {
    const current = callSessionsChannels.get(userId);
    if (!current) return;
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      current.disposed = true;
      if (current.retryTimer) clearTimeout(current.retryTimer);
      if (current.channel) void current.supabase.removeChannel(current.channel);
      callSessionsChannels.delete(userId);
    }
  };
}

/**
 * Subscribes to all `call_sessions` INSERT/UPDATE events for the current user
 * (Postgres RLS scopes the payload to conversations they participate in).
 * Multiple consumers share one underlying Supabase channel per userId.
 */
export function useCallSessionsChannel(
  userId: string | null,
  onChange: (change: CallSessionChange) => void
) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!userId) return;
    return subscribeCallSessionsChannel(userId, (change) => {
      onChangeRef.current(change);
    });
  }, [userId]);
}
