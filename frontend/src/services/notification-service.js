import { apiRequest } from "./api-client.js";

export async function fetchUserNotifications() {
  return apiRequest("/api/user/notifications");
}

export async function fetchUserUnreadNotificationCount() {
  return apiRequest("/api/user/notifications/unread-count");
}

export async function markUserNotificationRead(notificationId) {
  return apiRequest(`/api/user/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "POST"
  });
}

export async function markAllUserNotificationsRead() {
  return apiRequest("/api/user/notifications/read-all", {
    method: "POST"
  });
}
