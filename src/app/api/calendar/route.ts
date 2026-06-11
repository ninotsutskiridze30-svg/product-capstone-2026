import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { calendarEventCreateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  tutorId: z.string().uuid(),
});

export type CalendarEventsResponse = {
  events: {
    id: string;
    tutor_id: string;
    title: string | null;
    description: string | null;
    start_time: string;
    end_time: string;
    type:
      | "available"
      | "booked"
      | "blocked"
      | "lesson"
      | "pending"
      | "confirmed"
      | "invite_pending";
    color: string | null;
    created_at: string;
    is_recurring: boolean;
    recurrence_rule: unknown;
    recurrence_until: string | null;
  }[];
};

export type CalendarEventMutationResponse = {
  event: {
    id: string;
    tutor_id: string;
    title: string | null;
    description: string | null;
    start_time: string;
    end_time: string;
    type:
      | "available"
      | "booked"
      | "blocked"
      | "lesson"
      | "pending"
      | "confirmed"
      | "invite_pending";
    color: string | null;
    created_at: string;
    is_recurring: boolean;
    recurrence_rule: unknown;
    recurrence_until: string | null;
  };
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<CalendarEventsResponse | ApiErrorResponse>> {
  let tutorId: string | null = null;
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      tutorId: url.searchParams.get("tutorId"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tutor id" },
        { status: 400 }
      );
    }
    tutorId = parsed.data.tutorId;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select(
        "id,tutor_id,title,description,start_time,end_time,type,color,created_at,is_recurring,recurrence_rule,recurrence_until"
      )
      .eq("tutor_id", tutorId)
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    console.error("GET /api/calendar failed", {
      tutorId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to load calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<CalendarEventMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = calendarEventCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid event payload" },
        { status: 400 }
      );
    }

    if (parsed.data.tutorId !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        tutor_id: parsed.data.tutorId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        start_time: parsed.data.startTime,
        end_time: parsed.data.endTime,
        type: parsed.data.type,
        color: parsed.data.color ?? null,
        is_recurring: parsed.data.recurrenceType !== "none",
        recurrence_rule:
          parsed.data.recurrenceType === "none"
            ? null
            : { type: parsed.data.recurrenceType, interval: 1 },
        recurrence_until:
          parsed.data.recurrenceType === "none"
            ? null
            : (parsed.data.recurrenceUntil ?? null),
      })
      .select(
        "id,tutor_id,title,description,start_time,end_time,type,color,created_at,is_recurring,recurrence_rule,recurrence_until"
      )
      .single();

    if (error || !data) {
      throw error ?? new Error("Insert failed");
    }

    revalidateTag(`calendar-${parsed.data.tutorId}`, "max");

    return NextResponse.json({ event: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
