"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import type { NotificationGroup } from "@/app/api/notifications/route";
import { messageKeys } from "@/entities/message/api/message.query";
import {
  notificationHref,
  notificationKeys,
  notificationsListQueryOptions,
  useMarkAllNotificationsRead,
  useMarkNotificationsRead,
} from "@/entities/notification";
import { useCurrentUser } from "@/entities/user/api/user.query";
import { createBrowserClient } from "@/shared/api/supabase-browser";
import { useRouter } from "@/shared/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function NotificationsBell() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("notifications");
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationsRead();

  const { data: userRes } = useCurrentUser();
  const userId = userRes?.user?.id ?? null;
  const role = userRes?.user?.role ?? null;

  const { data } = useQuery({
    ...notificationsListQueryOptions(),
    enabled: !!userId,
  });

  const groups = data?.notifications ?? [];
  const unreadCount = groups.filter((group) => group.unreadCount > 0).length;

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
          // Conversations aren't streamed over Realtime; a new inbound message
          // always writes a notification, so refresh the chat sidebar too.
          void queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, queryClient]);

  function handleOpenChange(open: boolean) {
    // Viewing = read: clear the unread badge as soon as the popup opens, so it
    // stays cleared after the user closes it.
    if (open && unreadCount > 0) {
      markAll.mutate();
    }
  }

  function handleSelect(group: NotificationGroup) {
    if (group.unreadCount > 0) {
      markRead.mutate(group.ids);
    }
    if (role) {
      router.push(notificationHref(group.type, group.payload, role));
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("aria")}>
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groups.length === 0 ? (
          <DropdownMenuItem disabled>{t("empty")}</DropdownMenuItem>
        ) : (
          groups.map((group) => {
            const displayName = group.actor?.name ?? group.title;
            return (
              <DropdownMenuItem
                key={group.key}
                onSelect={() => handleSelect(group)}
                className="flex items-start gap-3"
              >
                <Avatar size="sm" className="mt-0.5">
                  {group.actor?.avatarUrl ? (
                    <AvatarImage src={group.actor.avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback>{initials(group.actor?.name ?? null)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{displayName}</span>
                    {group.unreadCount > 0 ? (
                      <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" aria-hidden />
                    ) : null}
                  </div>
                  {group.body ? (
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {group.body}
                    </span>
                  ) : null}
                  <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                    <span>
                      {formatDistanceToNow(new Date(group.created_at), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                    </span>
                    {group.count > 1 ? (
                      <span className="bg-muted text-foreground rounded-full px-1.5 py-0.5 font-medium">
                        {group.type === "message"
                          ? t("messagesCount", { count: group.count })
                          : t("itemsCount", { count: group.count })}
                      </span>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
