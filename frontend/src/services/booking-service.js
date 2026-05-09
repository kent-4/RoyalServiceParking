import { apiRequest } from "./api-client.js";

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

export async function fetchBookingContext(date) {
  return apiRequest(`/api/user/booking-context${buildQuery({ date })}`);
}

export async function fetchSlotSelection({ level, date, startTime }) {
  return apiRequest(
    `/api/user/bookings/slots${buildQuery({
      level,
      date,
      startTime
    })}`
  );
}

export async function createUserBooking(payload) {
  return apiRequest("/api/user/bookings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchUserBookings(filters = {}) {
  return apiRequest(`/api/user/bookings${buildQuery(filters)}`);
}

export async function cancelUserBooking(bookingId) {
  return apiRequest(`/api/user/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST"
  });
}
