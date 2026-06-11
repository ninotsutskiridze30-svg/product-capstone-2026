"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/entities/user/api/user.query";
import { Skeleton } from "@/shared/ui/skeleton";
import { MessagesWorkspace } from "@/widgets/chat-panel/messages-workspace";

interface Props {
  initialConversationId?: string;
}

export function StudentMessagesModule({ initialConversationId }: Props) {
  const t = useTranslations("dashboardStudent");
  const { data: userRes, isLoading } = useQuery(currentUserQueryOptions());

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  const userId = userRes?.user?.id;
  if (!userId) return null;

  return (
    <div className="min-h-0 space-y-6 lg:space-y-7">
      <div className="border-border bg-surface/70 min-h-0 rounded-2xl border p-3 shadow-sm md:p-4">
        <MessagesWorkspace
          userId={userId}
          role="student"
          {...(initialConversationId ? { initialConversationId } : {})}
        />
      </div>
    </div>
  );
}
