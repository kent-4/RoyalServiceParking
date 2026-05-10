import { apiRequest, downloadRequest } from "./api-client.js";

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

export async function fetchAdminReportsDashboard(filters = {}) {
  return apiRequest(`/api/admin/reports/dashboard${buildQuery(filters)}`);
}

export async function downloadAdminReport(format, filters = {}) {
  return downloadRequest(`/api/admin/reports/export/${format}${buildQuery(filters)}`);
}
