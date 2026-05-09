import { apiRequest } from "./api-client.js";

export async function fetchCashierDashboard() {
  return apiRequest("/api/cashier/dashboard");
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

export async function fetchCashierUsers(filters = {}) {
  return apiRequest(`/api/cashier/users${buildQuery(filters)}`);
}

export async function fetchCashierUserDetails(userId) {
  return apiRequest(`/api/cashier/users/${encodeURIComponent(userId)}`);
}

export async function fetchCashierBookings(filters = {}) {
  return apiRequest(`/api/cashier/bookings${buildQuery(filters)}`);
}

export async function markCashierBookingArrived(bookingId) {
  return apiRequest(`/api/cashier/bookings/${encodeURIComponent(bookingId)}/arrive`, {
    method: "POST"
  });
}
