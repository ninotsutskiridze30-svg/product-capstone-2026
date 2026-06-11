"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { toast } from "sonner";

import { useRespondToBookingRequest } from "@/entities/booking/api/booking.query";
import { Button } from "@/shared/ui/button";

export function TutorPendingBookingActions({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"acc" | "dec" | null>(null);
  const respond = useRespondToBookingRequest();

  async function act(decision: "accepted" | "declined") {
    setLoading(decision === "accepted" ? "acc" : "dec");
    try {
      await respond.mutateAsync({ requestId, status: decision });
      toast.success(
        decision === "accepted" ? "Booking accepted" : "Booking declined"
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        disabled={loading !== null}
        onClick={() => void act("accepted")}
      >
        {loading === "acc" ? "…" : "Accept"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={loading !== null}
        onClick={() => void act("declined")}
      >
        {loading === "dec" ? "…" : "Decline"}
      </Button>
    </div>
  );
}
