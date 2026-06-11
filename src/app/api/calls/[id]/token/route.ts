import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export type CallTokenResponse = {
  token: string;
  url: string;
  room: string;
  isInitiator: boolean;
  peerName: string;
  identity: string;
  displayName: string;
};

type ApiErrorResponse = { error: string };

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<CallTokenResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid call id" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "Server missing LiveKit configuration" },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    const { userId } = authResult.auth;

    const { data: call } = await supabase
      .from("call_sessions")
      .select(
        "id,conversation_id,livekit_room,initiated_by,status,conversations!inner(tutor_id,student_id)"
      )
      .eq("id", parsedParams.data.id)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    // Supabase typing for the inner join returns a record (one-to-one).
    const conv = call.conversations as unknown as {
      tutor_id: string;
      student_id: string;
    };
    if (conv.tutor_id !== userId && conv.student_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (call.status === "ended" || call.status === "declined" || call.status === "missed") {
      return NextResponse.json({ error: "Call no longer active" }, { status: 410 });
    }

    const peerId = conv.tutor_id === userId ? conv.student_id : conv.tutor_id;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name")
      .in("id", [userId, peerId]);

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile.full_name ?? "User"] as const)
    );
    const displayName = profileMap.get(userId) ?? "User";
    const peerName = profileMap.get(peerId) ?? "User";

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: displayName,
      ttl: 60 * 60, // 1 hour
    });
    token.addGrant({
      room: call.livekit_room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      url: livekitUrl,
      room: call.livekit_room,
      isInitiator: call.initiated_by === userId,
      peerName,
      identity: userId,
      displayName,
    });
  } catch {
    return NextResponse.json({ error: "Failed to mint token" }, { status: 500 });
  }
}
