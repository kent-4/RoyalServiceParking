import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderUserNavbar } from "../../components/navbar/user-navbar.js";
import { logout } from "../../services/auth-service.js";
import { fetchUserUnreadNotificationCount } from "../../services/notification-service.js";
import { setAuthState } from "../../state/auth-store.js";

export function renderUserShell({
  session,
  currentPath,
  eyebrow,
  title,
  description,
  content,
  headerActions = "",
  notice = ""
}) {
  return `
    ${renderUserNavbar({ session, currentPath })}
    <main class="app-main user-shell">
      <section class="user-shell__inner">
        <header class="page-header page-header--user">
          <div class="page-header__copy">
            <span class="eyebrow">${eyebrow}</span>
            <h1 class="page-title" tabindex="-1" data-page-heading>${title}</h1>
            <p class="page-copy page-copy--lead">${description}</p>
          </div>
          ${
            headerActions
              ? `<div class="page-header__actions">${headerActions}</div>`
              : ""
          }
        </header>
        ${
          session.blocklisted
            ? renderInlineAlert({
                tone: "warning",
                title: "Account restricted",
                message:
                  session.blocklistUntil
                    ? `Booking restrictions are active until ${session.blocklistUntil}.`
                    : "Booking restrictions are active on this account."
              })
            : ""
        }
        ${
          notice
            ? `
              <section class="user-notice-panel">
                ${notice}
              </section>
            `
            : ""
        }
        ${content}
      </section>
    </main>
  `;
}

export function bindUserShell({ navigate }) {
  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await logout();
    setAuthState({
      session: {
        authenticated: false,
        role: null
      }
    });
    navigate("/", { replace: true });
  });

  refreshUserNotificationBadge();
}

export async function refreshUserNotificationBadge() {
  const badge = document.querySelector("[data-notification-badge]");
  if (!badge) {
    return;
  }

  try {
    const data = await fetchUserUnreadNotificationCount();
    const count = Number(data?.count ?? 0);
    badge.textContent = String(count);
    badge.hidden = count <= 0;
  } catch {
    badge.hidden = true;
  }
}
