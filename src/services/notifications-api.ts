import { apiFetch } from "@/lib/api";
import type { NotificationListResponse } from "@/types/notification";

const basePath = "/api/notifications";

export async function getNotifications(params: URLSearchParams) {
  return apiFetch<NotificationListResponse>(`${basePath}?${params.toString()}`);
}

export async function markNotificationRead(notificationId: string) {
  return apiFetch<{ id: string }>(`${basePath}/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiFetch<{ success: boolean }>(`${basePath}/read-all`, { method: "PATCH" });
}
