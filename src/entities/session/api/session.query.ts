import { queryOptions, useQuery } from "@tanstack/react-query";
import { sessionApi } from "./session.api";

export const sessionKeys = {
  all: ["sessions"] as const,
  tutorBookings: () => [...sessionKeys.all, "tutor-bookings"] as const,
  studentBookings: () => [...sessionKeys.all, "student-bookings"] as const,
};

export const tutorBookingsDetailQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.tutorBookings(),
    queryFn: () => sessionApi.getTutorBookings(),
  });

export const studentBookingsDetailQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.studentBookings(),
    queryFn: () => sessionApi.getStudentBookings(),
  });

export const useTutorBookingsDetail = () =>
  useQuery(tutorBookingsDetailQueryOptions());

export const useStudentBookingsDetail = () =>
  useQuery(studentBookingsDetailQueryOptions());
