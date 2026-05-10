import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField, renderSelectField } from "../../components/form/form-field.js";
import { downloadAdminReport, fetchAdminReportsDashboard } from "../../services/report-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function formatPercent(value) {
  const amount = Number(value ?? 0);
  return `${amount.toFixed(2).replace(/\.00$/, "")}%`;
}

function buildDefaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
}

function buildExportFilename(format, filters) {
  const start = filters.startDate || "start";
  const end = filters.endDate || "end";
  const period = filters.period || "day";
  return `royal-service-parking-report_${start}_to_${end}_${period}.${format}`;
}

function triggerDownload({ blob, filename }) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function renderTrendCards(items, metricKey, formatValue, emptyMessage) {
  if (!items.length) {
    return `<div class="empty-state empty-state--table"><p class="empty-copy">${emptyMessage}</p></div>`;
  }

  const maxValue = Math.max(...items.map((item) => Number(item[metricKey] ?? 0)), 0);

  return `
    <div class="report-series">
      ${items
        .map((item) => {
          const value = Number(item[metricKey] ?? 0);
          const ratio = maxValue > 0 ? value / maxValue : 0;

          return `
            <article class="report-series__item">
              <div class="report-series__meta">
                <strong>${formatDate(item.date)}</strong>
                <span>${formatValue(value)}</span>
              </div>
              <div class="report-series__bar">
                <span class="report-series__fill" style="--report-fill:${ratio};"></span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderDistributionCards(items, emptyMessage) {
  if (!items.length) {
    return `<div class="empty-state empty-state--table"><p class="empty-copy">${emptyMessage}</p></div>`;
  }

  const maxValue = Math.max(...items.map((item) => Number(item.count ?? 0)), 0);

  return `
    <div class="report-series">
      ${items
        .map((item) => {
          const value = Number(item.count ?? 0);
          const ratio = maxValue > 0 ? value / maxValue : 0;

          return `
            <article class="report-series__item">
              <div class="report-series__meta">
                <strong>${item.label}</strong>
                <span>${value}</span>
              </div>
              <div class="report-series__bar">
                <span class="report-series__fill" style="--report-fill:${ratio};"></span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

export function createAdminReportsPage({ session, pathname, query }) {
  const defaults = buildDefaultRange();
  const initialFilters = {
    startDate: query?.get("startDate") ?? defaults.startDate,
    endDate: query?.get("endDate") ?? defaults.endDate,
    period: query?.get("period") ?? "day"
  };

  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin reports",
      title: "Review booking and earnings analytics",
      description:
        "Analyze completed activity, trend lines, and distribution summaries with date filters, period grouping, and direct Excel/PDF exports.",
      content: `
        <section class="dashboard-grid booking-flow-grid">
          ${renderPanelCard({
            className: "booking-form-card",
            title: "Report filters",
            description: "Choose a date range and aggregation period, then refresh the dashboard or export the same filtered dataset.",
            content: `
              <form class="stack-sm" data-admin-reports-form>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Start date",
                    inputId: "admin-reports-start-date",
                    input: renderInputField({
                      id: "admin-reports-start-date",
                      name: "startDate",
                      type: "date",
                      value: initialFilters.startDate
                    })
                  })}
                  ${renderFieldGroup({
                    label: "End date",
                    inputId: "admin-reports-end-date",
                    input: renderInputField({
                      id: "admin-reports-end-date",
                      name: "endDate",
                      type: "date",
                      value: initialFilters.endDate
                    })
                  })}
                </div>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Group by",
                    inputId: "admin-reports-period",
                    input: renderSelectField({
                      id: "admin-reports-period",
                      name: "period",
                      value: initialFilters.period,
                      options: [
                        { value: "day", label: "Daily" },
                        { value: "week", label: "Weekly" },
                        { value: "month", label: "Monthly" }
                      ]
                    }),
                    hint: "Exports use the exact same filter state shown on this dashboard."
                  })}
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply filters", type: "submit", tone: "primary" })}
                  ${renderButton({
                    label: "Export Excel",
                    type: "button",
                    tone: "secondary",
                    attributes: { "data-export-button": "excel" }
                  })}
                  ${renderButton({
                    label: "Export PDF",
                    type: "button",
                    tone: "secondary",
                    attributes: { "data-export-button": "pdf" }
                  })}
                  ${renderButton({ label: "Reset", href: "/admin/reports", tone: "secondary" })}
                  ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "ghost" })}
                </div>
                <div class="form-feedback" role="status" aria-live="polite" data-admin-reports-feedback></div>
              </form>
            `
          })}
          ${renderPanelCard({
            title: "Reporting note",
            content: `
              <ul class="journey-list">
                <li>Earnings count completed bookings only, matching the current backend report logic.</li>
                <li>Vehicle type distribution also counts completed bookings only.</li>
                <li>Excel exports keep tabular summaries, while PDF exports keep a printable summary table.</li>
              </ul>
            `
          })}
        </section>
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-reports-kpis>
          ${renderLoadingPanelCards({ count: 4 })}
        </section>
        <section class="dashboard-grid" data-admin-reports-panels>
          ${renderLoadingPanelCards({ count: 4, lines: 4 })}
        </section>
        <div data-admin-reports-alerts></div>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const form = document.querySelector("[data-admin-reports-form]");
      const kpiRoot = document.querySelector("[data-admin-reports-kpis]");
      const panelsRoot = document.querySelector("[data-admin-reports-panels]");
      const alertsRoot = document.querySelector("[data-admin-reports-alerts]");
      const feedbackNode = document.querySelector("[data-admin-reports-feedback]");
      const exportButtons = Array.from(document.querySelectorAll("[data-export-button]"));

      function readFilters() {
        const formData = new FormData(form);
        return {
          startDate: String(formData.get("startDate") ?? "").trim(),
          endDate: String(formData.get("endDate") ?? "").trim(),
          period: String(formData.get("period") ?? "day").trim() || "day"
        };
      }

      function setExportState(isLoading, activeFormat = "") {
        exportButtons.forEach((button) => {
          const format = button.getAttribute("data-export-button");
          const label = format === "excel" ? "Export Excel" : "Export PDF";

          button.disabled = isLoading;
          button.classList.toggle("is-loading", isLoading && format === activeFormat);
          button.innerHTML = `
            ${isLoading && format === activeFormat ? '<span class="button__spinner" aria-hidden="true"></span>' : ""}
            <span>${isLoading && format === activeFormat ? `Exporting ${format.toUpperCase()}...` : label}</span>
          `;
        });
      }

      async function loadDashboard(filters) {
        if (kpiRoot) {
          kpiRoot.innerHTML = renderLoadingPanelCards({ count: 4 });
        }
        if (panelsRoot) {
          panelsRoot.innerHTML = renderLoadingPanelCards({ count: 4, lines: 4 });
        }

        try {
          const data = await fetchAdminReportsDashboard(filters);

          if (alertsRoot) {
            alertsRoot.innerHTML = "";
          }

          if (kpiRoot) {
            kpiRoot.innerHTML = [
              renderKpiCard({ label: "Completed bookings", value: data.statistics.completedBookings }),
              renderKpiCard({ label: "Total earnings", value: formatCurrency(data.statistics.totalEarnings) }),
              renderKpiCard({ label: "Completion rate", value: formatPercent(data.statistics.completionRate) }),
              renderKpiCard({ label: "No-show bookings", value: data.statistics.noShowBookings })
            ].join("");
          }

          if (panelsRoot) {
            panelsRoot.innerHTML = [
              renderPanelCard({
                title: "Booking trend",
                description: `Completed bookings grouped by ${data.periodLabel.toLowerCase()}.`,
                content: renderTrendCards(
                  data.summary,
                  "completedBookings",
                  (value) => String(value),
                  "No completed booking trend data is available for this range."
                )
              }),
              renderPanelCard({
                title: "Earnings trend",
                description: `Completed-booking earnings grouped by ${data.periodLabel.toLowerCase()}.`,
                content: renderTrendCards(
                  data.summary,
                  "totalEarnings",
                  (value) => formatCurrency(value),
                  "No earnings data is available for this range."
                )
              }),
              renderPanelCard({
                title: "Vehicle type distribution",
                description: "Completed bookings only.",
                content: renderDistributionCards(
                  data.vehicleTypes,
                  "No vehicle-type data is available for this range."
                )
              }),
              renderPanelCard({
                title: "Booking status distribution",
                description: "Current backend report categories.",
                content: renderDistributionCards(
                  data.bookingStatuses,
                  "No booking-status data is available for this range."
                )
              })
            ].join("");
          }
        } catch (error) {
          if (kpiRoot) {
            kpiRoot.innerHTML = "";
          }
          if (panelsRoot) {
            panelsRoot.innerHTML = "";
          }
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Reports unavailable",
              message: error.message || "The admin reports dashboard could not be loaded."
            });
          }
        }
      }

      async function handleExport(format) {
        const filters = readFilters();

        if (feedbackNode) {
          feedbackNode.textContent = `Preparing ${format.toUpperCase()} export...`;
          feedbackNode.className = "form-feedback";
        }

        setExportState(true, format);

        try {
          const file = await downloadAdminReport(format, filters);
          triggerDownload({
            blob: file.blob,
            filename: file.filename || buildExportFilename(format, filters)
          });

          if (feedbackNode) {
            feedbackNode.textContent = `${format.toUpperCase()} export downloaded successfully.`;
            feedbackNode.className = "form-feedback form-feedback--success";
          }

          pushToast({
            tone: "success",
            title: `${format.toUpperCase()} export ready`,
            message: "The filtered report file has been downloaded."
          });
        } catch (error) {
          if (feedbackNode) {
            feedbackNode.textContent = error.message || `Unable to export ${format.toUpperCase()} report.`;
            feedbackNode.className = "form-feedback form-feedback--error";
          }

          pushToast({
            tone: "danger",
            title: "Export failed",
            message: error.message || `Unable to export ${format.toUpperCase()} report.`
          });
        } finally {
          setExportState(false);
        }
      }

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const filters = readFilters();
        const next = new URLSearchParams();

        ["startDate", "endDate", "period"].forEach((key) => {
          const value = filters[key];
          if (value) {
            next.set(key, value);
          }
        });

        navigate(`/admin/reports${next.toString() ? `?${next.toString()}` : ""}`, {
          replace: true
        });
      });

      exportButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const format = button.getAttribute("data-export-button");
          if (format) {
            handleExport(format);
          }
        });
      });

      await loadDashboard(initialFilters);
    }
  };
}
