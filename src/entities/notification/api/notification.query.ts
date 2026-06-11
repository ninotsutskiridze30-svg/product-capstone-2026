import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { NotificationsResponse } from "@/app/api/notifications/route";
import { notificationApi } from "./notification.api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const notificationsListQueryOptions = () =>
  queryOptions({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.getList(),
  });

export function useNotificationsList() {
  return useQuery(notificationsListQueryOptions());
}

/** Mark specific notification groups read (by their underlying ids). Optimistic. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => notificationApi.markRead(ids),
    onMutate: async (ids: string[]) => {
      const key = notificationKeys.list();
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<NotificationsResponse>(key);
      const idSet = new Set(ids);
      queryClient.setQueryData<NotificationsResponse>(key, (old) =>
        old
          ? {
              notifications: old.notifications.map((group) =>
                group.ids.some((id) => idSet.has(id))
                  ? { ...group, unreadCount: 0 }
                  : group
              ),
            }
          : old
      );
      return { prev };
    },
    onError: (_error, _ids, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationKeys.list(), ctx.prev);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

/** Mark every notification read. Optimistic — clears the unread badge instantly. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: async () => {
      const key = notificationKeys.list();
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<NotificationsResponse>(key);
      queryClient.setQueryData<NotificationsResponse>(key, (old) =>
        old
          ? {
              notifications: old.notifications.map((group) => ({
                ...group,
                unreadCount: 0,
              })),
            }
          : old
      );
      return { prev };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationKeys.list(), ctx.prev);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}
