import { addDays, endOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { tutorLessonInviteSchema } from "@/shared/lib/schemas";
import { getPostHogServer } from "@/shared/lib/analytics/posthog-server";

export const dynamic = "force-dynamic";

type RpcResult = {
  ok?: boolean;
  booking_request_id?: string;
  error_code?: string;
  message?: string;
};

type ApiErrorResponse = {
  error: string;
};

export async function POST(
  request: Request
): Promise<NextResponse<{ ok: true } | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = tutorLessonInviteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid invite payload" },
        { status: 400 }
      );
    }

    const validInput = parsed.data;
    const supabase = await createServerClient();
    const tutorId = authResult.auth.userId;

    const start = new Date(validInput.startIso);
    const end = new Date(validInput.endIso);
    const durationMs = end.getTime() - start.getTime();
    if (durationMs <= 0) {
      return NextResponse.json({ error: "End must be after start" }, { status: 400 });
    }

    const weekdays = new Set(validInput.recurrenceWeekdays ?? []);
    const hasRecurrence = weekdays.size > 0 && Boolean(validInput.recurrenceUntilDate);
    const requestedSlots: { startTime: string; endTime: string }[] = [];

    if (!hasRecurrence) {
      requestedSlots.push({
        startTime: validInput.startIso,
        endTime: validInput.endIso,
      });
    } else {
      const until = endOfDay(new Date(validInput.recurrenceUntilDate!));
      let cursor = new Date(start);
      while (cursor <= until) {
        if (weekdays.has(cursor.getDay())) {
          const slotStart = new Date(cursor);
          slotStart.setHours(
            start.getHours(),
            start.getMinutes(),
            start.getSeconds(),
            start.getMilliseconds()
          );
          const slotEnd = new Date(slotStart.getTime() + durationMs);
          if (slotStart <= until) {
            requestedSlots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
            });
          }
        }
        cursor = addDays(cursor, 1);
      }
      if (requestedSlots.length === 0) {
        return NextResponse.json(
          {
            error:
              "Selected weekdays do not produce any lesson slots before end date",
          },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase.rpc("rpc_create_booking_request_atomic", {
      p_tutor_id: tutorId,
      p_student_id: validInput.studentId,
      p_requested_slots: requestedSlots,
      p_recurrence_type: hasRecurrence ? "custom" : "once",
      p_initiated_by: "tutor",
      p_type: validInput.type,
      p_message: validInput.message?.trim() || null,
      p_field_id: validInput.fieldId ?? null,
      p_allow_partial: false,
    });

    if (error) {
      throw error;
    }

    const result = data as RpcResult;
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.message ?? result.error_code ?? "Could not create invite",
        },
        { status: 400 }
      );
    }

    if (result.booking_request_id) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("tutor_id", tutorId)
        .eq("student_id", validInput.studentId)
        .maybeSingle();
      if (conv?.id) {
        await supabase
          .from("conversations")
          .update({ booking_request_id: result.booking_request_id })
          .eq("id", conv.id);
      }
    }

    await supabase.from("notifications").insert({
      user_id: validInput.studentId,
      type: "booking_request",
      title: "Lesson invitation",
      body: "Your tutor proposed a lesson time. Open bookings to respond.",
      payload: {
        bookingRequestId: result.booking_request_id,
        tutorId,
      },
      actor_id: tutorId,
      is_read: false,
    });

    revalidatePath("/dashboard/tutor/calendar");
    revalidatePath("/dashboard/tutor/bookings");
    revalidatePath("/dashboard/student/bookings");

    const ph = getPostHogServer();
    if (ph) {
      ph.capture({
        distinctId: tutorId,
        event: "tutor_lesson_invite_sent",
        properties: {
          tutor_id: tutorId,
          student_id: validInput.studentId,
          type: validInput.type,
          slot_count: requestedSlots.length,
        },
      });
      await ph.shutdown();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create lesson invite" },
      { status: 500 }
    );
  }
}
