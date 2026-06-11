import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { conversationCreateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type ConversationsResponse = {
  conversations: {
    id: string;
    tutor_id: string;
    student_id: string;
    created_at: string;
    last_message_at: string | null;
    peer_name: string;
  }[];
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

type ApiErrorResponse = {
  error: string;
};

export async function GET(): Promise<
  NextResponse<ConversationsResponse | ApiErrorResponse>
> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();
    const { userId, role } = authResult.auth;

    const { data: conversations, error } =
      role === "tutor"
        ? await supabase
            .from("conversations")
            .select("id,tutor_id,student_id,created_at,last_message_at")
            .eq("tutor_id", userId)
            .order("last_message_at", { ascending: false })
        : await supabase
            .from("conversations")
            .select("id,tutor_id,student_id,created_at,last_message_at")
            .eq("student_id", userId)
            .order("last_message_at", { ascending: false });

    if (error) {
      throw error;
    }

    const { data: connections, error: connectionsError } =
      role === "tutor"
        ? await supabase.from("connections").select("student_id").eq("tutor_id", userId)
        : await supabase.from("connections").select("tutor_id").eq("student_id", userId);
    if (connectionsError) {
      throw connectionsError;
    }
    const allowedPeerIds = new Set(
      role === "tutor"
        ? (connections ?? []).map((connection) => {
            if (!("student_id" in connection)) return "";
            return connection.student_id;
          })
        : (connections ?? []).map((connection) => {
            if (!("tutor_id" in connection)) return "";
            return connection.tutor_id;
          })
    );
    const filteredConversations = (conversations ?? []).filter((conversation) =>
      role === "tutor"
        ? allowedPeerIds.has(conversation.student_id)
        : allowedPeerIds.has(conversation.tutor_id)
    );
    const peerIds = filteredConversations.map((conversation) =>
      role === "tutor" ? conversation.student_id : conversation.tutor_id
    );

    const { data: peers } = await supabase
      .from("profiles")
      .select("id,full_name")
      .in("id", peerIds);
    const peerNameById = new Map(
      (peers ?? []).map((peer) => [peer.id, peer.full_name ?? "User"] as const)
    );

    return NextResponse.json({
      conversations: filteredConversations.map((conversation) => ({
        ...conversation,
        peer_name:
          peerNameById.get(
            role === "tutor" ? conversation.student_id : conversation.tutor_id
          ) ?? "User",
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<ConversationMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = conversationCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    if (
      parsed.data.studentId !== authResult.auth.userId &&
      parsed.data.tutorId !== authResult.auth.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createServerClient();
    if (
      authResult.auth.role === "student" &&
      authResult.auth.userId === parsed.data.studentId
    ) {
      const { error: connectError } = await supabase.from("connections").upsert(
        {
          tutor_id: parsed.data.tutorId,
          student_id: parsed.data.studentId,
          created_by: authResult.auth.userId,
        },
        {
          onConflict: "student_id,tutor_id",
          ignoreDuplicates: true,
        }
      );
      if (connectError) {
        throw connectError;
      }
    }
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .select("id")
      .eq("tutor_id", parsed.data.tutorId)
      .eq("student_id", parsed.data.studentId)
      .maybeSingle();
    if (connectionError) {
      throw connectionError;
    }
    if (!connection) {
      return NextResponse.json({ error: "Pair is not connected" }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("id,tutor_id,student_id,created_at,last_message_at")
      .eq("tutor_id", parsed.data.tutorId)
      .eq("student_id", parsed.data.studentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        tutor_id: parsed.data.tutorId,
        student_id: parsed.data.studentId,
      })
      .select("id,tutor_id,student_id,created_at,last_message_at")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to create conversation");
    }

    if (authResult.auth.userId === parsed.data.studentId) {
      await supabase.from("notifications").insert({
        user_id: parsed.data.tutorId,
        type: "message",
        title: "New connection request",
        body: "A student wants to connect and message with you.",
        payload: { conversationId: data.id, studentId: parsed.data.studentId },
        actor_id: parsed.data.studentId,
        is_read: false,
      });
    }

    return NextResponse.json({ conversation: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
