import { parseIsoDate } from "@/shared/api/services/_shared";
import { fetchJson } from "@/shared/api/services/_shared";
import type {
  BookingCreateInput,
  BookingUpdateInput,
} from "@/shared/lib/schemas/booking.schema";

export type BookingListItem = {
  id: string;
  tutor_id: string;
  student_id: string;
  status: string;
  type: "online" | "onsite";
  proposed_start: Date | null;
  proposed_end: Date | null;
  created_at: Date;
  message: string | null;
  initiated_by: "student" | "tutor";
  requested_slots: unknown;
};

export type BookingListResponse = {
  bookings: BookingListItem[];
};

function normalizeBookingDates(
  booking: {
    id: string;
    tutor_id: string;
    student_id: string;
    status: string;
    type: "online" | "onsite";
    proposed_start: string | null;
    proposed_end: string | null;
    created_at: string;
    message: string | null;
    initiated_by: "student" | "tutor";
    requested_slots: unknown;
  }
): BookingListItem {
  return {
    ...booking,
    created_at: parseIsoDate(booking.created_at),
    proposed_start: booking.proposed_start
      ? parseIsoDate(booking.proposed_start)
      : null,
    proposed_end: booking.proposed_end ? parseIsoDate(booking.proposed_end) : null,
  };
}

export async function getBookings(): Promise<BookingListResponse> {
  const response = await fetchJson<{
    bookings: {
      id: string;
      tutor_id: string;
      student_id: string;
      status: string;
      type: "online" | "onsite";
      proposed_start: string | null;
      proposed_end: string | null;
      created_at: string;
      message: string | null;
      initiated_by: "student" | "tutor";
      requested_slots: unknown;
    }[];
  }>("/api/bookings");
  return {
    bookings: response.bookings.map((item) => normalizeBookingDates(item)),
  };
}

export async function createBooking(input: BookingCreateInput) {
  return fetchJson<{ bookingId: string; tutorId: string; userId: string }>(
    "/api/bookings",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateBooking(id: string, input: BookingUpdateInput) {
  return fetchJson<{ id: string; status: string; tutorId: string }>(
    `/api/bookings/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export async function cancelBooking(id: string) {
  return fetchJson<{ id: string; cancelled: true }>(`/api/bookings/${id}`, {
    method: "DELETE",
  });
}
