import { apiRequest } from "./api-client.js";

export async function fetchUserDashboard() {
  return apiRequest("/api/user/dashboard");
}

export async function fetchUserProfile() {
  return apiRequest("/api/profile/me");
}

export async function updateUserProfile(payload) {
  return apiRequest("/api/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
