const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && payload.message) ||
      `Request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function parseFilename(contentDisposition) {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return standardMatch?.[1] ?? null;
}

export async function downloadRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    headers: {
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await parseResponse(response);
    const message =
      (payload && typeof payload === "object" && payload.message) ||
      `Request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    blob: await response.blob(),
    filename: parseFilename(response.headers.get("content-disposition")),
    contentType: response.headers.get("content-type") || "application/octet-stream"
  };
}
