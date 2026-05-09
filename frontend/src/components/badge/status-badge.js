const badgeConfig = {
  RESERVED: { tone: "warning", label: "Reserved" },
  ARRIVED: { tone: "info", label: "Arrived" },
  COMPLETED: { tone: "success", label: "Completed" },
  CANCELED: { tone: "danger", label: "Canceled" },
  BLOCKLISTED: { tone: "danger", label: "Restricted" }
};

export function renderStatusBadge(status) {
  const key = String(status || "UNKNOWN").toUpperCase();
  const config = badgeConfig[key] || { tone: "neutral", label: key };

  return `<span class="status-badge status-badge--${config.tone}">${config.label}</span>`;
}
