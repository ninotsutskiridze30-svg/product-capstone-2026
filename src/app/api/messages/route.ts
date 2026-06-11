import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { messageCreateSchema, messageListQuerySchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type MessagesListResponse = {
  messages: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    attachment_type: string | null;
    attachment_ref: string | null;
    is_read: boolean;
    created_at: string;
  }[];
};

export type MessageMutationResponse = {
  message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    attachment_type: string | null;
    attachment_ref: string | null;
    is_read: boolean;
    created_at: string;
  };
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<MessagesListResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const url = new URL(request.url);
    const parsed = messageListQuerySchema.safeParse({
      conversationId: url.searchParams.get("conversationId"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid conversation id" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id,tutor_id,student_id")
      .eq("id", parsed.data.conversationId)
      .maybeSingle();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (
      conversation.student_id !== authResult.auth.userId &&
      conversation.tutor_id !== authResult.auth.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id,conversation_id,sender_id,content,attachment_type,attachment_ref,is_read,created_at")
      .eq("conversation_id", parsed.data.conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<MessageMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = messageCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id,tutor_id,student_id")
      .eq("id", parsed.data.conversationId)
      .maybeSingle();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (
      conversation.student_id !== authResult.auth.userId &&
      conversation.tutor_id !== authResult.auth.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: parsed.data.conversationId,
        sender_id: authResult.auth.userId,
        content: parsed.data.content,
        is_read: false,
      })
      .select("id,conversation_id,sender_id,content,attachment_type,attachment_ref,is_read,created_at")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to send message");
    }

    await supabase
      .from("conversations")
      .update({ last_message_at: data.created_at })
      .eq("id", parsed.data.conversationId);

    const recipientId =
      conversation.student_id === authResult.auth.userId
        ? conversation.tutor_id
        : conversation.student_id;

    await supabase.from("notifications").insert({
      user_id: recipientId,
      type: "message",
      title: "New message",
      body: parsed.data.content.slice(0, 120),
      payload: { conversationId: parsed.data.conversationId },
      actor_id: authResult.auth.userId,
      is_read: false,
    });

    return NextResponse.json({ message: data });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
