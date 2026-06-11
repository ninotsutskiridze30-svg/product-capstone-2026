import { parseIsoDate } from "@/shared/api/services/_shared";
import { fetchJson } from "@/shared/api/services/_shared";
import type { NotificationsPatchInput } from "@/shared/lib/schemas/notifications.schema";

export type NotificationDto = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: Date;
};

export async function getNotifications() {
  const response = await fetchJson<{
    notifications: (Omit<NotificationDto, "created_at"> & {
      created_at: string;
    })[];
  }>("/api/notifications");

  return {
    notifications: response.notifications.map((item) => ({
      ...item,
      created_at: parseIsoDate(item.created_at),
    })),
  };
}

export async function markNotificationsRead(input: NotificationsPatchInput) {
  return fetchJson<{ success: true }>("/api/notifications", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
