import { customFetch } from "@/lib/workspace-api-mock";

export type NotificationType =
  | "order"
  | "order_update"
  | "contest_update"
  | "contest_winner"
  | "system"
  | "message";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  url: string | null;
  isRead: boolean;
  createdAt: string;
  actorId: number | null;
};

export function listNotifications(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const suffix = params.toString();
  return customFetch<{ notifications: NotificationItem[] }>(
    `/api/notifications${suffix ? `?${suffix}` : ""}`,
    { credentials: "include" },
  );
}

export function getUnreadNotificationsCount() {
  return customFetch<{ unreadCount: number }>("/api/notifications/unread-count", {
    credentials: "include",
  });
}

export function markNotificationRead(notificationId: number) {
  return customFetch<{ ok: true }>(`/api/notifications/${notificationId}/read`, {
    method: "POST",
    credentials: "include",
  });
}

export function markAllNotificationsRead() {
  return customFetch<{ ok: true }>("/api/notifications/mark-all-read", {
    method: "POST",
    credentials: "include",
  });
}
