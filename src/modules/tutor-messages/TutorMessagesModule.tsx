"use client";

import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/entities/user/api/user.query";
import { Skeleton } from "@/shared/ui/skeleton";
import { MessagesWorkspace } from "@/widgets/chat-panel/messages-workspace";

interface Props {
  initialConversationId?: string;
}

export function TutorMessagesModule({ initialConversationId }: Props) {
  const { data: userRes, isLoading, isError, error } = useQuery(
    currentUserQueryOptions()
  );

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium">Unable to load your account data.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {error instanceof Error ? error.message : "Please refresh and try again."}
        </p>
      </div>
    );
  }

  const userId = userRes?.user?.id;
  if (!userId) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Your session is not available.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Please sign in again to open your messages.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 space-y-6 lg:space-y-7">
      <div className="min-h-0 rounded-2xl border border-border bg-surface/70 p-3 shadow-sm md:p-4">
        <MessagesWorkspace
          userId={userId}
          role="tutor"
          {...(initialConversationId ? { initialConversationId } : {})}
        />
      </div>
    </div>
  );
}
