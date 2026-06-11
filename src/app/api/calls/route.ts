import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { callCreateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type CallMutationResponse = {
  call: {
    id: string;
    conversation_id: string;
    livekit_room: string;
    status: "ringing" | "active" | "ended" | "declined" | "missed";
    initiated_by: string;
    created_at: string;
  };
};

type ApiErrorResponse = { error: string };

export async function POST(
  request: Request
): Promise<NextResponse<CallMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = callCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { userId } = authResult.auth;

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id,tutor_id,student_id")
      .eq("id", parsed.data.conversationId)
      .maybeSingle();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.tutor_id !== userId && conversation.student_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Both parties must be in `connections` — same gate as messaging.
    const { data: connection } = await supabase
      .from("connections")
      .select("id")
      .eq("tutor_id", conversation.tutor_id)
      .eq("student_id", conversation.student_id)
      .maybeSingle();
    if (!connection) {
      return NextResponse.json(
        { error: "Not connected with this user" },
        { status: 403 }
      );
    }

    const roomName = `call_${crypto.randomUUID()}`;

    const { data: call, error } = await supabase
      .from("call_sessions")
      .insert({
        conversation_id: conversation.id,
        initiated_by: userId,
        livekit_room: roomName,
        status: "ringing",
      })
      .select("id,conversation_id,livekit_room,status,initiated_by,created_at")
      .single();

    if (error || !call) {
      throw error ?? new Error("Failed to create call");
    }

    // Notify the recipient so banner can also show outside the dashboard.
    const recipientId =
      conversation.tutor_id === userId
        ? conversation.student_id
        : conversation.tutor_id;
    await supabase.from("notifications").insert({
      user_id: recipientId,
      type: "message",
      title: "Incoming call",
      body: "Someone is calling you",
      payload: { callId: call.id, conversationId: conversation.id },
      actor_id: userId,
      is_read: false,
    });

    return NextResponse.json({ call });
  } catch {
    return NextResponse.json({ error: "Failed to start call" }, { status: 500 });
  }
}
