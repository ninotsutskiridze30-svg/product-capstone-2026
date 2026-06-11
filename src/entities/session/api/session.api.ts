import { fetchJson } from "@/shared/api/services/_shared";
import type { TutorBookingsDetail, StudentBookingsDetail } from "../model/session.schema";

export const sessionApi = {
  getTutorBookings: async (): Promise<TutorBookingsDetail> => {
    return fetchJson<TutorBookingsDetail>("/api/tutor/bookings-detail");
  },

  getStudentBookings: async (): Promise<StudentBookingsDetail> => {
    return fetchJson<StudentBookingsDetail>("/api/student/bookings-detail");
  },
};
