import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { notificationsPatchSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type NotificationType =
  | "booking_request"
  | "message"
  | "review"
  | "session_reminder"
  | "booking_accepted"
  | "booking_declined"
  | "booking_expired"
  | "booking_cancelled"
  | "booking_invite"
  | "booking_invite_declined"
  | "homework_assigned"
  | "homework_submitted"
  | "homework_graded"
  | "homework_revision_requested"
  | "homework_ai_review_ready";

export type NotificationActor = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

/**
 * A collapsed notification. Multiple raw rows from the same person/context
 * (e.g. 10 chat messages) are merged into one group carrying the latest content,
 * the total `count`, the `unreadCount`, and every underlying id (for mark-read).
 */
export type NotificationGroup = {
  key: string;
  type: NotificationType;
  title: string;
  body: string | null;
  created_at: string;
  payload: Record<string, unknown>;
  ids: string[];
  count: number;
  unreadCount: number;
  actor: NotificationActor | null;
};

export type NotificationsResponse = {
  notifications: NotificationGroup[];
};

export type NotificationsPatchResponse = {
  success: true;
};

type ApiErrorResponse = {
  error: string;
};

type RawNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  payload: unknown;
  actor_id: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Group key. Chat messages collapse per conversation (1:1, so per person);
 * every other type stays on its own row.
 */
function groupKeyFor(row: RawNotification): string {
  if (row.type === "message") {
    // "All messages from one person collapse into one row." Group by the sender
    // (actor_id) — robust regardless of payload shape. Fall back to the
    // conversation id (triggers emit snake_case; the app uses camelCase).
    if (row.actor_id) {
      return `message-actor:${row.actor_id}`;
    }
    const payload = asRecord(row.payload);
    const conversationId = payload.conversationId ?? payload.conversation_id;
    if (typeof conversationId === "string" && conversationId) {
      return `message:${conversationId}`;
    }
  }
  return `id:${row.id}`;
}

function groupNotifications(
  rows: RawNotification[],
  actorById: Map<string, NotificationActor>
): NotificationGroup[] {
  // Rows arrive newest-first; a Map preserves insertion order, so the first row
  // seen for a key is the latest and the groups stay sorted newest-first.
  const groups = new Map<string, NotificationGroup>();
  for (const row of rows) {
    const key = groupKeyFor(row);
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(row.id);
      existing.count += 1;
      if (!row.is_read) existing.unreadCount += 1;
      continue;
    }
    groups.set(key, {
      key,
      type: row.type,
      title: row.title,
      body: row.body,
      created_at: row.created_at,
      payload: asRecord(row.payload),
      ids: [row.id],
      count: 1,
      unreadCount: row.is_read ? 0 : 1,
      actor: row.actor_id ? actorById.get(row.actor_id) ?? null : null,
    });
  }
  return [...groups.values()];
}

export async function GET(): Promise<
  NextResponse<NotificationsResponse | ApiErrorResponse>
> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("id,user_id,type,title,body,is_read,created_at,payload,actor_id")
      .eq("user_id", authResult.auth.userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as unknown as RawNotification[];

    // Resolve actor profiles (who triggered each notification) in one query.
    const actorIds = [
      ...new Set(rows.map((row) => row.actor_id).filter((id): id is string => !!id)),
    ];
    const actorById = new Map<string, NotificationActor>();
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", actorIds);
      for (const actor of actors ?? []) {
        actorById.set(actor.id, {
          id: actor.id,
          name: actor.full_name,
          avatarUrl: actor.avatar_url,
        });
      }
    }

    return NextResponse.json({
      notifications: groupNotifications(rows, actorById),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request
): Promise<NextResponse<NotificationsPatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = notificationsPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    if ("all" in parsed.data) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", authResult.auth.userId)
        .eq("is_read", false);
    } else {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", authResult.auth.userId)
        .in("id", parsed.data.ids);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
