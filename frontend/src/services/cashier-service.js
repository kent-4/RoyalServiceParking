import { apiRequest } from "./api-client.js";

export async function fetchCashierDashboard() {
  return apiRequest("/api/cashier/dashboard");
}
