"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { toast } from "sonner";

import { useCreateConversation } from "@/entities/message/api/message.query";
import { useCurrentUser } from "@/entities/user/api/user.query";
import { Button } from "@/shared/ui/button";
import { track } from "@/shared/lib/analytics/events";

type Props = {
  tutorId: string;
};

export function RequestTutorConnectionButton({ tutorId }: Props) {
  const router = useRouter();
  const { data: userRes } = useCurrentUser();
  const createConversation = useCreateConversation();

  const studentId = userRes?.user?.id ?? null;
  const isStudent = userRes?.user?.role === "student";
  const loginRedirect = `/login?redirect=${encodeURIComponent(`/tutors/${tutorId}`)}`;

  async function onRequest() {
    if (!studentId) {
      router.push(loginRedirect);
      return;
    }
    if (!isStudent) {
      toast.message("Students only", {
        description: "Only student accounts can request a tutor connection.",
      });
      return;
    }
    void track("booking_started", { locale: "", tutor_id: tutorId });
    try {
      const data = await createConversation.mutateAsync({ tutorId, studentId });
      void track("tutor_connection_requested", { tutor_id: tutorId });
      router.push(
        `/dashboard/student/messages?conversation=${encodeURIComponent(data.conversation.id)}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start conversation"
      );
    }
  }

  return (
    <Button
      className="w-full"
      onClick={() => void onRequest()}
      disabled={createConversation.isPending}
    >
      {createConversation.isPending ? "Connecting…" : "Request this tutor"}
    </Button>
  );
}
