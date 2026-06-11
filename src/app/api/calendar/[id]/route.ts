import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { calendarEventPatchSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export type CalendarEventPatchResponse = {
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

export type CalendarEventDeleteResponse = {
  id: string;
  deleted: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<CalendarEventPatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const parsedBody = calendarEventPatchSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    if (parsedBody.data.tutorId !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const updatePayload: {
      title?: string | null;
      description?: string | null;
      start_time?: string;
      end_time?: string;
      type?:
        | "available"
        | "booked"
        | "blocked"
        | "lesson"
        | "pending"
        | "confirmed"
        | "invite_pending";
      color?: string | null;
      is_recurring?: boolean;
      recurrence_rule?: { type: "daily" | "weekly"; interval: number } | null;
      recurrence_until?: string | null;
    } = {};

    if (parsedBody.data.title !== undefined) updatePayload.title = parsedBody.data.title;
    if (parsedBody.data.description !== undefined) {
      updatePayload.description = parsedBody.data.description;
    }
    if (parsedBody.data.startTime !== undefined) {
      updatePayload.start_time = parsedBody.data.startTime;
    }
    if (parsedBody.data.endTime !== undefined) {
      updatePayload.end_time = parsedBody.data.endTime;
    }
    if (parsedBody.data.type !== undefined) updatePayload.type = parsedBody.data.type;
    if (parsedBody.data.color !== undefined) updatePayload.color = parsedBody.data.color;
    if (parsedBody.data.recurrenceType !== undefined) {
      updatePayload.is_recurring = parsedBody.data.recurrenceType !== "none";
      updatePayload.recurrence_rule =
        parsedBody.data.recurrenceType === "none"
          ? null
          : { type: parsedBody.data.recurrenceType, interval: 1 };
    }
    if (parsedBody.data.recurrenceUntil !== undefined) {
      updatePayload.recurrence_until = parsedBody.data.recurrenceUntil;
    }
    if (parsedBody.data.recurrenceType === "none") {
      updatePayload.recurrence_until = null;
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .update(updatePayload)
      .eq("id", parsedParams.data.id)
      .eq("tutor_id", authResult.auth.userId)
      .select(
        "id,tutor_id,title,description,start_time,end_time,type,color,created_at,is_recurring,recurrence_rule,recurrence_until"
      )
      .single();

    if (error || !data) {
      throw error ?? new Error("Update failed");
    }

    revalidateTag(`calendar-${data.tutor_id}`, "max");

    return NextResponse.json({ event: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<CalendarEventDeleteResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: event } = await supabase
      .from("calendar_events")
      .select("id,tutor_id")
      .eq("id", parsedParams.data.id)
      .eq("tutor_id", authResult.auth.userId)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", event.id)
      .eq("tutor_id", authResult.auth.userId);
    if (error) {
      throw error;
    }

    revalidateTag(`calendar-${event.tutor_id}`, "max");

    return NextResponse.json({ id: event.id, deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
