import { apiRequest } from "./api-client.js";

export async function fetchCurrentSession() {
  return apiRequest("/api/auth/me");
}

export async function login(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout", {
    method: "POST"
  });
}

export async function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyEmailToken(token) {
  return apiRequest(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}

export async function requestPasswordReset(email) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function validateResetToken(token) {
  return apiRequest(`/api/auth/reset-token?token=${encodeURIComponent(token)}`);
}

export async function resetPassword(payload) {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
