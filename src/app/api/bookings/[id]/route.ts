import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { bookingUpdateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export type BookingPatchResponse = {
  id: string;
  status: "accepted" | "declined";
  tutorId: string;
};

export type BookingDeleteResponse = {
  id: string;
  cancelled: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<BookingPatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const parsedBody = bookingUpdateSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: booking, error: bookingError } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("id", parsedParams.data.id)
      .eq("tutor_id", authResult.auth.userId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const status = parsedBody.data.status;
    const { error: updateError } = await supabase
      .from("booking_requests")
      .update({ status })
      .eq("id", booking.id);
    if (updateError) {
      throw updateError;
    }

    if (status === "accepted") {
      let calendarEventId = booking.calendar_event_id;
      if (!calendarEventId && booking.proposed_start && booking.proposed_end) {
        const { data: event } = await supabase
          .from("calendar_events")
          .insert({
            tutor_id: booking.tutor_id,
            title: "Lesson",
            description: booking.message,
            start_time: booking.proposed_start,
            end_time: booking.proposed_end,
            type: "lesson",
            color: "#3b82f6",
          })
          .select("id")
          .single();
        calendarEventId = event?.id ?? null;
      } else if (calendarEventId) {
        await supabase
          .from("calendar_events")
          .update({ type: "lesson", color: "#3b82f6" })
          .eq("id", calendarEventId)
          .eq("tutor_id", booking.tutor_id);
      }

      await supabase.from("lesson_sessions").insert({
        tutor_id: booking.tutor_id,
        student_id: booking.student_id,
        calendar_event_id: calendarEventId,
        field_id: booking.field_id,
        type: booking.type,
        status: "confirmed",
        price: null,
        currency: "USD",
      });
    }

    await supabase.from("notifications").insert({
      user_id: booking.student_id,
      type: status === "accepted" ? "booking_accepted" : "booking_declined",
      title:
        status === "accepted"
          ? "Booking accepted"
          : "Booking declined",
      body:
        status === "accepted"
          ? "Your booking request has been accepted."
          : "Your booking request was declined.",
      payload: { bookingId: booking.id, tutorId: booking.tutor_id },
      actor_id: booking.tutor_id,
      is_read: false,
    });

    revalidateTag(`bookings-${booking.tutor_id}`, "max");
    revalidateTag(`bookings-${booking.student_id}`, "max");
    revalidateTag(`calendar-${booking.tutor_id}`, "max");
    revalidateTag(`tutor-${booking.tutor_id}`, "max");

    return NextResponse.json({
      id: booking.id,
      status,
      tutorId: booking.tutor_id,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<BookingDeleteResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: booking, error: bookingError } = await supabase
      .from("booking_requests")
      .select("id,tutor_id,student_id")
      .eq("id", parsedParams.data.id)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      booking.student_id !== authResult.auth.userId &&
      booking.tutor_id !== authResult.auth.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("booking_requests")
      .update({ status: "cancelled" })
      .eq("id", booking.id);
    if (error) {
      throw error;
    }

    revalidateTag(`bookings-${booking.student_id}`, "max");
    revalidateTag(`bookings-${booking.tutor_id}`, "max");
    revalidateTag(`calendar-${booking.tutor_id}`, "max");

    return NextResponse.json({ id: booking.id, cancelled: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
