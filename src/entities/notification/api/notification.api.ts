import type { NotificationsResponse } from "@/app/api/notifications/route";
import { fetchJson } from "@/shared/api/services/_shared";

export const notificationApi = {
  getList: async () => {
    return fetchJson<NotificationsResponse>("/api/notifications");
  },

  markAllRead: async () => {
    return fetchJson<{ success: true }>("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ all: true as const }),
    });
  },

  markRead: async (ids: string[]) => {
    return fetchJson<{ success: true }>("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });
  },
};
