import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BookingUpdateInput } from "@/shared/lib/schemas";
import {
  bookingApi,
  type BookingInviteResponseAction,
} from "./booking.api";

export const bookingKeys = {
  all: ["bookings"] as const,
};

export function useRespondToBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: BookingUpdateInput["status"];
    }) => bookingApi.patchBookingRequest(requestId, { status }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useRespondToLessonInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingRequestId,
      action,
    }: {
      bookingRequestId: string;
      action: BookingInviteResponseAction;
    }) => bookingApi.respondToLessonInvite(bookingRequestId, action),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
