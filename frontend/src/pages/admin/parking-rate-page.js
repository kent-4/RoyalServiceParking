import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField } from "../../components/form/form-field.js";
import { fetchAdminParkingRate, updateAdminParkingRate } from "../../services/admin-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function renderRatePanels(hourlyRate) {
  return `
    ${renderPanelCard({
      className: "operations-card-accent",
      title: "Current hourly rate",
      content: `
        <div class="admin-account-hero admin-account-hero--compact">
          <div class="admin-avatar-badge admin-avatar-badge--rate">PHP</div>
          <div class="admin-account-hero__copy">
            <span class="eyebrow">Active configuration</span>
            <h2>${formatCurrency(hourlyRate)}</h2>
            <p class="page-copy">This rate is used by new booking guidance, cashier completion, and printed receipt totals.</p>
          </div>
          <span class="status-badge status-badge--success">Active rate</span>
        </div>
        <div class="admin-preview-grid">
          <article><span>Example for 1 hour</span><strong>${formatCurrency(hourlyRate)}</strong></article>
          <article><span>Example for 4 hours</span><strong>${formatCurrency(hourlyRate * 4)}</strong></article>
          <article><span>Example for 12 hours</span><strong>${formatCurrency(hourlyRate * 12)}</strong></article>
        </div>
      `
    })}
    ${renderPanelCard({
      title: "Rate policy",
      content: `
        <ul class="admin-policy-list">
          <li><strong>Cashier scope:</strong> Cashiers can review the current rate but cannot change it from their portal.</li>
          <li><strong>Billing rule:</strong> Partial hours are still rounded up by the backend during completion.</li>
          <li><strong>Versioning note:</strong> Historical rate tracking remains an open product decision, so this updates the single active rate only.</li>
        </ul>
      `,
      footer: `
        <div class="auth-support-links">
          ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "secondary" })}
          ${renderButton({ label: "Open bookings", href: "/admin/bookings", tone: "ghost" })}
        </div>
      `
    })}
  `;
}

export function createAdminParkingRatePage({ session, pathname }) {
  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin parking rate",
      title: "Review and update the active hourly rate",
      description:
        "Manage the current parking rate used across reservation pricing, cashier completion, and printed receipt totals.",
      actions: `
        ${renderButton({ label: "Open bookings", href: "/admin/bookings", tone: "secondary" })}
        ${renderButton({ label: "Open reports", href: "/admin/reports", tone: "ghost" })}
      `,
      content: `
        <div data-admin-rate-alerts></div>
        <section class="dashboard-grid admin-overview-grid" data-admin-rate-panels>
          ${renderLoadingPanelCards({ count: 2 })}
        </section>
        <section class="stack-sm" data-admin-rate-form-shell>
          ${renderLoadingPanelCards({ count: 1, lines: 4 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const alertsRoot = document.querySelector("[data-admin-rate-alerts]");
      const panelsRoot = document.querySelector("[data-admin-rate-panels]");
      const formShell = document.querySelector("[data-admin-rate-form-shell]");

      let currentRate = 0;
      let isSubmitting = false;

      function renderForm(hourlyRate) {
        if (!formShell) {
          return;
        }

        formShell.innerHTML = renderPanelCard({
          className: "booking-form-card",
          title: "Update hourly rate",
          description: "Submit a new amount to change the single active backend parking rate used for new reservations and cashier completion.",
          content: `
            <form class="stack-sm" data-admin-rate-form novalidate>
              <div class="field-row field-row--single">
                ${renderFieldGroup({
                  label: "Hourly rate",
                  inputId: "admin-hourly-rate",
                  input: renderInputField({
                    id: "admin-hourly-rate",
                    name: "hourlyRate",
                    type: "number",
                    value: String(hourlyRate),
                    placeholder: "0.00",
                    attributes: {
                      step: "0.01",
                      min: "0.01",
                      inputmode: "decimal"
                    }
                  }),
                  hint: "Enter the active rate in Philippine peso for one parking hour."
                })}
              </div>
              <div class="admin-note-surface">
                <strong>Change effect</strong>
                <p>Updates apply immediately to new bookings. Existing backend billing rules still control final cashier collection and receipt totals.</p>
              </div>
              <div class="auth-support-links">
                ${renderButton({ label: "Save rate", type: "submit", tone: "primary" })}
                ${renderButton({ label: "Reset value", type: "button", tone: "secondary", attributes: { "data-admin-rate-reset": true } })}
              </div>
            </form>
          `
        });

        const form = document.querySelector("[data-admin-rate-form]");
        const resetButton = document.querySelector("[data-admin-rate-reset]");
        const input = document.querySelector("#admin-hourly-rate");

        resetButton?.addEventListener("click", () => {
          if (input) {
            input.value = String(currentRate);
          }
          if (alertsRoot) {
            alertsRoot.innerHTML = "";
          }
        });

        form?.addEventListener("submit", async (event) => {
          event.preventDefault();

          if (isSubmitting || !input) {
            return;
          }

          const nextRate = Number(input.value);
          if (!Number.isFinite(nextRate) || nextRate <= 0) {
            if (alertsRoot) {
              alertsRoot.innerHTML = renderInlineAlert({
                tone: "danger",
                title: "Invalid rate",
                message: "Enter a numeric hourly rate greater than zero."
              });
            }
            input.focus();
            return;
          }

          isSubmitting = true;
          const submitButton = form.querySelector("button[type='submit']");
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
          }

          try {
            const response = await updateAdminParkingRate(nextRate);
            currentRate = Number(response.hourlyRate || nextRate);

            if (panelsRoot) {
              panelsRoot.innerHTML = renderRatePanels(currentRate);
            }

            renderForm(currentRate);
            if (alertsRoot) {
              alertsRoot.innerHTML = renderInlineAlert({
                tone: "success",
                title: "Parking rate updated",
                message: `The active hourly rate is now ${formatCurrency(currentRate)}.`
              });
            }
            pushToast({
              tone: "success",
              title: "Rate saved",
              message: `Active hourly rate updated to ${formatCurrency(currentRate)}.`
            });
          } catch (error) {
            if (alertsRoot) {
              alertsRoot.innerHTML = renderErrorState({
                title: "Unable to update rate",
                message: error.message || "The parking rate could not be updated."
              });
            }
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Save rate";
            }
          } finally {
            isSubmitting = false;
          }
        });
      }

      try {
        const data = await fetchAdminParkingRate();
        currentRate = Number(data.hourlyRate || 0);

        if (panelsRoot) {
          panelsRoot.innerHTML = renderRatePanels(currentRate);
        }

        renderForm(currentRate);
      } catch (error) {
        if (panelsRoot) {
          panelsRoot.innerHTML = renderErrorState({
            title: "Parking rate unavailable",
            message: error.message || "The active parking rate could not be loaded."
          });
        }
        if (formShell) {
          formShell.innerHTML = "";
        }
      }
    }
  };
}
