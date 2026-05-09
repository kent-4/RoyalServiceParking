import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { fetchSlotSelection, createUserBooking } from "../../services/booking-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

function renderSlotSkeleton() {
  return Array.from({ length: 8 })
    .map(
      () => `
        <article class="slot-card slot-card--loading">
          <div class="loading-block loading-block--title"></div>
          <div class="loading-block loading-block--line"></div>
          <div class="loading-block loading-block--line"></div>
        </article>
      `
    )
    .join("");
}

export function createUserSelectSlotPage({ session, pathname, query }) {
  const level = query?.get("level") ?? "";
  const date = query?.get("date") ?? "";
  const time = query?.get("time") ?? "";

  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Slot selection",
      title: "Choose the exact parking slot",
      description:
        "Review the filtered slots for the chosen level, then confirm the reservation with the backend.",
      content: `
        <section class="dashboard-grid booking-flow-grid">
          <article class="panel-card booking-form-card">
            <div data-slot-alerts></div>
            <div class="slot-meta-grid" data-slot-meta></div>
            <div class="slot-grid" data-slot-grid>
              ${renderSlotSkeleton()}
            </div>
          </article>
          <article class="panel-card" data-slot-selection-card>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const alertsRoot = document.querySelector("[data-slot-alerts]");
      const metaRoot = document.querySelector("[data-slot-meta]");
      const slotGrid = document.querySelector("[data-slot-grid]");
      const selectionCard = document.querySelector("[data-slot-selection-card]");

      if (!level || !date || !time) {
        navigate("/user/book", { replace: true });
        return;
      }

      let currentData = null;
      let selectedSlot = "";
      let submitInFlight = false;

      function renderAlerts() {
        if (!alertsRoot || !currentData) {
          return;
        }

        if (currentData.blocklisted) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "danger",
            title: "Booking is restricted",
            message:
              currentData.blocklistUntil
                ? `${currentData.blocklistMessage} Access resumes after ${formatDate(currentData.blocklistUntil)}.`
                : currentData.blocklistMessage
          });
          return;
        }

        if (currentData.activeBooking) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "warning",
            title: "Resolve the current active booking first",
            message: `The backend still limits users to one active reserved or arrived booking at a time. Existing booking: ${currentData.activeBooking.level} ${currentData.activeBooking.slotName} on ${formatDate(
              currentData.activeBooking.date
            )}.`
          });
          return;
        }

        alertsRoot.innerHTML = renderInlineAlert({
          tone: "info",
          title: "Selection rule",
          message: "Unavailable slots are excluded by the current booking conflict logic. Pick one available slot, then confirm the reservation."
        });
      }

      function renderMeta() {
        if (!metaRoot || !currentData) {
          return;
        }

        metaRoot.innerHTML = `
          <article class="booking-meta-card">
            <span>Date</span>
            <strong>${formatDate(currentData.date)}</strong>
          </article>
          <article class="booking-meta-card">
            <span>Scheduled time</span>
            <strong>${formatTime(currentData.startTime)}</strong>
          </article>
          <article class="booking-meta-card">
            <span>Level</span>
            <strong>${currentData.level}</strong>
          </article>
          <article class="booking-meta-card">
            <span>Estimated cost</span>
            <strong>${formatCurrency(currentData.estimatedCost)}</strong>
          </article>
        `;
      }

      function renderSelectionCard() {
        if (!selectionCard || !currentData) {
          return;
        }

        const disabled = currentData.blocklisted || Boolean(currentData.activeBooking) || !selectedSlot || submitInFlight;

        selectionCard.innerHTML = `
          <h2>Reservation summary</h2>
          <p class="page-copy">Confirming this step creates a reserved booking immediately.</p>
          <div class="detail-list">
            <div><span>Level</span><strong>${currentData.level}</strong></div>
            <div><span>Date</span><strong>${formatDate(currentData.date)}</strong></div>
            <div><span>Start time</span><strong>${formatTime(currentData.startTime)}</strong></div>
            <div><span>Exit time</span><strong>${formatTime(currentData.exitTime)}</strong></div>
            <div><span>Selected slot</span><strong>${selectedSlot || "Select a slot first"}</strong></div>
            <div><span>Estimated cost</span><strong>${formatCurrency(currentData.estimatedCost)}</strong></div>
          </div>
          <div class="auth-support-links">
            <button class="button button--primary" type="button" data-confirm-booking ${disabled ? "disabled" : ""}>
              ${submitInFlight ? "Confirming..." : "Confirm reservation"}
            </button>
            <a class="button button--secondary" href="/user/book?date=${encodeURIComponent(
              currentData.date
            )}&time=${encodeURIComponent(currentData.startTime)}&level=${encodeURIComponent(currentData.level)}" data-link>
              Back to booking details
            </a>
          </div>
        `;

        selectionCard.querySelector("[data-confirm-booking]")?.addEventListener("click", async () => {
          const approved = await openConfirmDialog({
            title: "Confirm this reservation",
            message: `Reserve ${selectedSlot} on ${currentData.level} for ${formatDate(currentData.date)} at ${formatTime(
              currentData.startTime
            )}?`,
            confirmLabel: "Confirm booking"
          });

          if (!approved) {
            return;
          }

          submitInFlight = true;
          renderSelectionCard();

          try {
            await createUserBooking({
              level: currentData.level,
              slotName: selectedSlot,
              date: currentData.date,
              startTime: currentData.startTime
            });
            pushToast({
              tone: "success",
              title: "Booking confirmed",
              message: `${currentData.level} ${selectedSlot} is now reserved.`
            });
            navigate("/user/bookings", { replace: true });
          } catch (error) {
            if (alertsRoot) {
              alertsRoot.innerHTML = renderInlineAlert({
                tone: "danger",
                title: "Unable to confirm booking",
                message: error.message || "The booking could not be created."
              });
            }
          } finally {
            submitInFlight = false;
            renderSelectionCard();
          }
        });
      }

      function renderSlots() {
        if (!slotGrid || !currentData) {
          return;
        }

        slotGrid.innerHTML = currentData.slots
          .map((slot) => {
            const selected = slot.slotName === selectedSlot;
            return `
              <button
                class="slot-card ${slot.available ? "" : "is-unavailable"} ${selected ? "is-selected" : ""}"
                type="button"
                data-slot-option="${slot.slotName}"
                ${slot.available && !currentData.blocklisted && !currentData.activeBooking ? "" : "disabled"}
                aria-pressed="${selected ? "true" : "false"}"
              >
                <strong>${slot.slotName}</strong>
                <span>${slot.available ? "Available" : "Unavailable"}</span>
                <small>${slot.message}</small>
              </button>
            `;
          })
          .join("");
      }

      slotGrid?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-slot-option]");
        if (!button || !currentData) {
          return;
        }

        selectedSlot = button.getAttribute("data-slot-option") || "";
        renderSlots();
        renderSelectionCard();
      });

      try {
        currentData = await fetchSlotSelection({
          level,
          date,
          startTime: time
        });
        renderAlerts();
        renderMeta();
        renderSlots();
        renderSelectionCard();
      } catch (error) {
        if (alertsRoot) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "danger",
            title: "Slot selection unavailable",
            message: error.message || "The selected booking details could not be loaded."
          });
        }
        if (metaRoot) {
          metaRoot.innerHTML = "";
        }
        if (selectionCard) {
          selectionCard.innerHTML = `
            <h2>Return to booking setup</h2>
            <p class="page-copy">Refresh the booking details and try loading the level again.</p>
            <div class="auth-support-links">
              <a class="button button--secondary" href="/user/book?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}" data-link>
                Back to booking setup
              </a>
            </div>
          `;
        }
        if (slotGrid) {
          slotGrid.innerHTML = "";
        }
      }
    }
  };
}
