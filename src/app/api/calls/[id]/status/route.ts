import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { callStatusUpdateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

type ApiErrorResponse = { error: string };

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ ok: true } | ApiErrorResponse>> {
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

    const parsedBody = callStatusUpdateSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { userId } = authResult.auth;

    const { data: call } = await supabase
      .from("call_sessions")
      .select("id,status,started_at,conversation_id,conversations!inner(tutor_id,student_id)")
      .eq("id", parsedParams.data.id)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    const conv = call.conversations as unknown as {
      tutor_id: string;
      student_id: string;
    };
    if (conv.tutor_id !== userId && conv.student_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextStatus = parsedBody.data.status;

    // Idempotent terminal-state guard: once a call is missed/declined/ended,
    // a later "ended" write from a racing client (e.g. the caller-side 30 s
    // timer vs. an explicit leave) must not overwrite it.
    const terminalStatuses = new Set(["ended", "declined", "missed"]);
    if (
      terminalStatuses.has(call.status) &&
      terminalStatuses.has(nextStatus)
    ) {
      return NextResponse.json({ ok: true });
    }
    const update: {
      status: typeof nextStatus;
      started_at?: string;
      ended_at?: string;
    } = { status: nextStatus };

    const now = new Date().toISOString();
    if (nextStatus === "active" && !call.started_at) {
      update.started_at = now;
    }
    if (nextStatus === "ended" || nextStatus === "declined" || nextStatus === "missed") {
      update.ended_at = now;
    }

    const { error } = await supabase
      .from("call_sessions")
      .update(update)
      .eq("id", call.id);
    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
