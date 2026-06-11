import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";

export const dynamic = "force-dynamic";

export type BookingListResponse = {
  bookings: {
    id: string;
    tutor_id: string;
    student_id: string;
    status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
    type: "online" | "onsite";
    proposed_start: string | null;
    proposed_end: string | null;
    created_at: string;
    message: string | null;
    initiated_by: "student" | "tutor";
    requested_slots: unknown;
  }[];
};

export type BookingCreateResponse = {
  bookingId: string;
  tutorId: string;
  userId: string;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(): Promise<
  NextResponse<BookingListResponse | ApiErrorResponse>
> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();
    const { userId, role } = authResult.auth;
    const { data, error } =
      role === "tutor"
        ? await supabase
            .from("booking_requests")
            .select(
              "id,tutor_id,student_id,status,type,proposed_start,proposed_end,created_at,message,initiated_by,requested_slots"
            )
            .eq("tutor_id", userId)
            .order("created_at", { ascending: false })
        : await supabase
            .from("booking_requests")
            .select(
              "id,tutor_id,student_id,status,type,proposed_start,proposed_end,created_at,message,initiated_by,requested_slots"
            )
            .eq("student_id", userId)
            .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(
  _request: Request
): Promise<NextResponse<BookingCreateResponse | ApiErrorResponse>> {
  await cookies();
  return NextResponse.json(
    {
      error:
        "Direct booking requests are disabled. Connect with a tutor from their profile, then they can propose lesson times.",
    },
    { status: 403 }
  );
}
