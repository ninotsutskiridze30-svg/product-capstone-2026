import { parseIsoDate } from "@/shared/api/services/_shared";
import { fetchJson } from "@/shared/api/services/_shared";
import type {
  CalendarEventCreateInput,
  CalendarEventPatchInput,
} from "@/shared/lib/schemas/calendar.schema";

export type CalendarEventDto = {
  id: string;
  tutor_id: string;
  title: string | null;
  description: string | null;
  start_time: Date;
  end_time: Date;
  type:
    | "available"
    | "booked"
    | "blocked"
    | "lesson"
    | "pending"
    | "confirmed"
    | "invite_pending";
  color: string | null;
  is_recurring?: boolean;
  recurrence_rule?: unknown;
  recurrence_until?: string | null;
};

export type CalendarEventsResponse = {
  events: CalendarEventDto[];
};

function normalizeEvent(
  event: Omit<CalendarEventDto, "start_time" | "end_time"> & {
    start_time: string;
    end_time: string;
  }
): CalendarEventDto {
  return {
    ...event,
    start_time: parseIsoDate(event.start_time),
    end_time: parseIsoDate(event.end_time),
  };
}

export async function getCalendarEvents(
  tutorId: string
): Promise<CalendarEventsResponse> {
  const response = await fetchJson<{
    events: (Omit<CalendarEventDto, "start_time" | "end_time"> & {
      start_time: string;
      end_time: string;
    })[];
  }>(`/api/calendar?tutorId=${tutorId}`);

  return {
    events: response.events.map((event) => normalizeEvent(event)),
  };
}

export async function createCalendarEvent(input: CalendarEventCreateInput) {
  return fetchJson<{ event: CalendarEventDto }>("/api/calendar", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCalendarEvent(
  id: string,
  input: CalendarEventPatchInput
) {
  return fetchJson<{ event: CalendarEventDto }>(`/api/calendar/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCalendarEvent(id: string) {
  return fetchJson<{ id: string }>(`/api/calendar/${id}`, {
    method: "DELETE",
  });
}
