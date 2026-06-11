import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { getPostHogServer } from "@/shared/lib/analytics/posthog-server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  bookingRequestId: z.string().uuid(),
  action: z.enum(["accept", "decline"]),
});

type RpcOk = { ok?: boolean; error_code?: string };

type ApiErrorResponse = {
  error: string;
};

export async function POST(
  request: Request
): Promise<NextResponse<{ ok: true } | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("student");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const studentId = authResult.auth.userId;

    const { data: bookingRow } = await supabase
      .from("booking_requests")
      .select("tutor_id")
      .eq("id", parsed.data.bookingRequestId)
      .maybeSingle();

    const rpcName =
      parsed.data.action === "accept"
        ? "rpc_accept_tutor_lesson_invite"
        : "rpc_decline_tutor_lesson_invite";

    const { data, error } = await supabase.rpc(rpcName, {
      p_booking_request_id: parsed.data.bookingRequestId,
    });

    if (error) {
      throw error;
    }

    const result = data as RpcOk;
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error_code ?? "Could not update invite" },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard/student/bookings");
    revalidatePath("/dashboard/tutor/calendar");
    revalidatePath("/dashboard/tutor/bookings");

    const ph = getPostHogServer();
    if (ph && bookingRow?.tutor_id) {
      const eventName =
        parsed.data.action === "accept" ? "booking_confirmed" : "booking_invite_declined";
      ph.capture({
        distinctId: studentId,
        event: eventName,
        properties: {
          booking_id: parsed.data.bookingRequestId,
          tutor_id: bookingRow.tutor_id,
          locale: "",
          ...(parsed.data.action === "accept"
            ? { slot_start: "", tutor_id: bookingRow.tutor_id }
            : {}),
        },
      });
      await ph.shutdown();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to respond to invite" },
      { status: 500 }
    );
  }
}
