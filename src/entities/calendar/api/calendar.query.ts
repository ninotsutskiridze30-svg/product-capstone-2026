import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CalendarEventCreateInput,
  CalendarEventPatchInput,
  TutorLessonInviteInput,
} from "@/shared/lib/schemas";
import { calendarApi } from "./calendar.api";

export const calendarKeys = {
  all: ["calendar"] as const,
  tutorData: () => [...calendarKeys.all, "tutor-data"] as const,
};

export const tutorCalendarDataQueryOptions = () =>
  queryOptions({
    queryKey: calendarKeys.tutorData(),
    queryFn: () => calendarApi.getTutorCalendarData(),
  });

export const useTutorCalendarData = () =>
  useQuery(tutorCalendarDataQueryOptions());

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CalendarEventCreateInput) => calendarApi.createEvent(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.tutorData() });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string;
      input: CalendarEventPatchInput;
    }) => calendarApi.updateEvent(eventId, input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.tutorData() });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => calendarApi.deleteEvent(eventId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.tutorData() });
    },
  });
}

export function useCreateTutorLessonInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TutorLessonInviteInput) =>
      calendarApi.createTutorLessonInvite(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.tutorData() });
    },
  });
}
