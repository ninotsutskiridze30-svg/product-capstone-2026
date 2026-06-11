import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";

export const dynamic = "force-dynamic";

export type ActiveCallSummary = {
  id: string;
  conversation_id: string;
  status: "ringing" | "active";
  initiated_by: string;
  created_at: string;
};

export type ActiveCallsResponse = {
  activeCalls: ActiveCallSummary[];
};

type ApiErrorResponse = { error: string };

export async function GET(): Promise<
  NextResponse<ActiveCallsResponse | ApiErrorResponse>
> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();

    // RLS already restricts call_sessions to conversation participants,
    // so a plain status filter is enough — no manual conversation join.
    const { data, error } = await supabase
      .from("call_sessions")
      .select("id,conversation_id,status,initiated_by,created_at")
      .in("status", ["ringing", "active"])
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const activeCalls = (data ?? []).filter(
      (row): row is ActiveCallSummary =>
        row.status === "ringing" || row.status === "active"
    );

    return NextResponse.json({ activeCalls });
  } catch {
    return NextResponse.json(
      { error: "Failed to load active calls" },
      { status: 500 }
    );
  }
}
