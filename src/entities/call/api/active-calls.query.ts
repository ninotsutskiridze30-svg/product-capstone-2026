"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type {
  ActiveCallSummary,
  ActiveCallsResponse,
} from "@/app/api/calls/active/route";
import { useAuthUserId } from "@/entities/user/api/user.query";
import { fetchJson } from "@/shared/api/services/_shared";
import {
  type CallSessionChange,
  useCallSessionsChannel,
} from "@/shared/hooks/useRealtime";

export const activeCallsKeys = {
  all: ["calls", "active"] as const,
};

type ActiveCallEntry = {
  callId: string;
  status: "ringing" | "active";
  initiatedBy: string;
};

/**
 * Tracks every conversation the current user is in that has a ringing or
 * active call, keyed by conversation_id. Seeded from /api/calls/active and
 * kept fresh by the shared call-sessions Realtime channel.
 */
export function useActiveCallsByConversation(): Map<string, ActiveCallEntry> {
  const userId = useAuthUserId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: activeCallsKeys.all,
    queryFn: () =>
      fetchJson<ActiveCallsResponse>("/api/calls/active", { method: "GET" }),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const onCallChange = useCallback(
    ({ row }: CallSessionChange) => {
      queryClient.setQueryData<ActiveCallsResponse>(activeCallsKeys.all, (prev) => {
        const current = prev?.activeCalls ?? [];
        const without = current.filter((c) => c.id !== row.id);
        if (row.status === "ringing" || row.status === "active") {
          const next: ActiveCallSummary = {
            id: row.id,
            conversation_id: row.conversation_id,
            status: row.status,
            initiated_by: row.initiated_by,
            created_at: row.created_at,
          };
          return { activeCalls: [next, ...without] };
        }
        // Terminal status — drop the row.
        return { activeCalls: without };
      });
    },
    [queryClient]
  );

  useCallSessionsChannel(userId, onCallChange);

  return useMemo(() => {
    const map = new Map<string, ActiveCallEntry>();
    for (const call of query.data?.activeCalls ?? []) {
      // If two calls exist for the same conversation, keep the most recent
      // (results are already ordered DESC by created_at server-side, so the
      // first writer wins and we skip later ones).
      if (!map.has(call.conversation_id)) {
        map.set(call.conversation_id, {
          callId: call.id,
          status: call.status,
          initiatedBy: call.initiated_by,
        });
      }
    }
    return map;
  }, [query.data?.activeCalls]);
}
