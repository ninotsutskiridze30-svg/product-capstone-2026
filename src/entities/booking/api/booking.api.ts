import type { BookingUpdateInput } from "@/shared/lib/schemas";
import { fetchJson } from "@/shared/api/services/_shared";

export type BookingInviteResponseAction = "accept" | "decline";

export const bookingApi = {
  patchBookingRequest: async (requestId: string, body: BookingUpdateInput) => {
    return fetchJson<{
      id: string;
      status: "accepted" | "declined";
      tutorId: string;
    }>(`/api/bookings/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  respondToLessonInvite: async (
    bookingRequestId: string,
    action: BookingInviteResponseAction
  ) => {
    return fetchJson<{ ok: true }>("/api/bookings/invite-response", {
      method: "POST",
      body: JSON.stringify({ bookingRequestId, action }),
    });
  },
};
