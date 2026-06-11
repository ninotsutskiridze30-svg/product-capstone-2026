"use server";

export type BookingRequestInput = {
  tutorId: string;
  calendarEventId?: string | null;
  proposedStart?: string | null;
  proposedEnd?: string | null;
  message?: string | null;
  fieldId?: string | null;
  type: "online" | "onsite";
};

/** @deprecated Use tutor-proposed lessons or connect via messages. */
export async function createBookingRequestAction(
  _input: BookingRequestInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  return {
    ok: false,
    message:
      "Booking from the calendar is no longer available. Use “Request this tutor” on the tutor profile to start a conversation.",
  };
}
