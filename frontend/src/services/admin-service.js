import { apiRequest } from "./api-client.js";

export async function fetchAdminDashboard() {
  return apiRequest("/api/admin/dashboard");
}

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const search = query.toString();
  return search ? `?${search}` : "";
}

export async function fetchAdminUsers(filters = {}) {
  return apiRequest(`/api/admin/users${buildQuery(filters)}`);
}

export async function fetchAdminUserDetails(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`);
}

export async function fetchAdminBookings(filters = {}) {
  return apiRequest(`/api/admin/bookings${buildQuery(filters)}`);
}

export async function fetchAdminParkingRate() {
  return apiRequest("/api/admin/parking-rates/current");
}

export async function updateAdminParkingRate(hourlyRate) {
  return apiRequest("/api/admin/parking-rates/current", {
    method: "PUT",
    body: JSON.stringify({ hourlyRate })
  });
}

export async function fetchAdminBlocklist() {
  return apiRequest("/api/admin/blocklist");
}

export async function removeAdminBlocklist(userId) {
  return apiRequest(`/api/admin/blocklist/${encodeURIComponent(userId)}/remove`, {
    method: "POST"
  });
}
