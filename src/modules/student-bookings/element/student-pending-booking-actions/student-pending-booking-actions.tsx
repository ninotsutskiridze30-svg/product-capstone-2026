"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useRespondToLessonInvite } from "@/entities/booking/api/booking.query";
import { Button } from "@/shared/ui/button";
import { track } from "@/shared/lib/analytics/events";

type Slot = { startTime?: string; endTime?: string };

function parsePendingWindow(row: {
  proposed_start: string | null;
  proposed_end: string | null;
  requested_slots: unknown;
  initiated_by: string | null;
}): { label: string | null } {
  if (
    row.initiated_by === "tutor" &&
    Array.isArray(row.requested_slots) &&
    row.requested_slots.length > 0
  ) {
    const slot = row.requested_slots[0] as Slot;
    if (slot.startTime && slot.endTime) {
      const a = new Date(slot.startTime);
      const b = new Date(slot.endTime);
      return {
        label: `${format(a, "PPp", { locale: enUS })} – ${format(b, "p", { locale: enUS })}`,
      };
    }
  }
  if (row.proposed_start) {
    return {
      label: format(new Date(row.proposed_start), "PPp", { locale: enUS }),
    };
  }
  return { label: null };
}

type Row = {
  id: string;
  tutor_id: string;
  type: "online" | "onsite";
  proposed_start: string | null;
  proposed_end: string | null;
  message: string | null;
  initiated_by: string | null;
  requested_slots: unknown;
};

type Props = {
  row: Row;
  tutorName: string;
};

export function StudentPendingBookingRow({ row, tutorName }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const respondInvite = useRespondToLessonInvite();
  const { label } = parsePendingWindow(row);
  const showInviteActions = row.initiated_by === "tutor";

  async function onAccept() {
    setBusy("accept");
    try {
      await respondInvite.mutateAsync({
        bookingRequestId: row.id,
        action: "accept",
      });
      void track("booking_invite_accepted", { booking_id: row.id, tutor_id: row.tutor_id });
      toast.success("Lesson accepted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not accept");
    }
    setBusy(null);
  }

  async function onDecline() {
    setBusy("decline");
    try {
      await respondInvite.mutateAsync({
        bookingRequestId: row.id,
        action: "decline",
      });
      void track("booking_invite_declined", { booking_id: row.id, tutor_id: row.tutor_id });
      toast.success("Invitation declined");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not decline");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="font-medium">{tutorName}</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {showInviteActions ? "Tutor invited you" : "Pending"}
          </span>
          <span className="bg-muted rounded px-1.5 py-0.5 text-xs">{row.type}</span>
        </span>
      </div>
      {label ? (
        <p className="text-muted-foreground">{label}</p>
      ) : null}
      {row.message ? (
        <p className="text-muted-foreground text-xs">&ldquo;{row.message}&rdquo;</p>
      ) : null}
      {showInviteActions ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={() => void onAccept()} disabled={busy !== null}>
            {busy === "accept" ? "…" : "Accept"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void onDecline()}
            disabled={busy !== null}
          >
            {busy === "decline" ? "…" : "Decline"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
