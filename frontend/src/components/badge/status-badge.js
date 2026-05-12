const badgeConfig = {
  RESERVED: { tone: "info", label: "Reserved", icon: "calendar" },
  ARRIVED: { tone: "warning", label: "Arrived", icon: "car" },
  COMPLETED: { tone: "success", label: "Completed", icon: "check" },
  CANCELED: { tone: "neutral", label: "Canceled", icon: "cancel" },
  NO_SHOW: { tone: "danger", label: "No show", icon: "warning" },
  BLOCKLISTED: { tone: "critical", label: "Blocklisted", icon: "block" }
};

export function renderStatusBadge(status) {
  const key = String(status || "UNKNOWN").toUpperCase();
  const config = badgeConfig[key] || { tone: "neutral", label: key, icon: "" };

  return `
    <span class="status-badge status-badge--${config.tone}">
      ${config.icon ? `<span class="status-badge__icon" aria-hidden="true">${config.icon}</span>` : ""}
      <span>${config.label}</span>
    </span>
  `;
}
