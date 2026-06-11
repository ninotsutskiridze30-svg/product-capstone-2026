import { fetchJson } from "@/shared/api/services/_shared";
import type {
  CalendarEventCreateInput,
  CalendarEventPatchInput,
  TutorLessonInviteInput,
} from "@/shared/lib/schemas";
import type { CalendarEventBaseRow } from "@/shared/lib/calendar-recurrence";

export type { CalendarEventBaseRow };

export type ConnectedStudent = {
  id: string;
  name: string;
};

export type TutorCalendarDataResponse = {
  tutorId: string;
  events: CalendarEventBaseRow[];
  connectedStudents: ConnectedStudent[];
};

export type CalendarEventMutationResponse = {
  event: CalendarEventBaseRow & {
    tutor_id: string;
    description: string | null;
    created_at: string;
  };
};

export const calendarApi = {
  getTutorCalendarData: async (): Promise<TutorCalendarDataResponse> => {
    return fetchJson<TutorCalendarDataResponse>("/api/tutor/calendar-data");
  },

  createEvent: async (input: CalendarEventCreateInput) => {
    return fetchJson<CalendarEventMutationResponse>("/api/calendar", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateEvent: async (eventId: string, input: CalendarEventPatchInput) => {
    return fetchJson<CalendarEventMutationResponse>(`/api/calendar/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteEvent: async (eventId: string) => {
    return fetchJson<{ id: string; deleted: true }>(`/api/calendar/${eventId}`, {
      method: "DELETE",
    });
  },

  createTutorLessonInvite: async (input: TutorLessonInviteInput) => {
    return fetchJson<{ ok: true }>("/api/bookings/tutor-invite", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
