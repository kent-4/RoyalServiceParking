import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderUserNavbar } from "../../components/navbar/user-navbar.js";
import { logout } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";

export function renderUserShell({ session, currentPath, eyebrow, title, description, content }) {
  return `
    ${renderUserNavbar({ session, currentPath })}
    <main class="app-main user-shell">
      <section class="user-shell__inner">
        <header class="page-header">
          <span class="eyebrow">${eyebrow}</span>
          <h1 class="page-title" tabindex="-1" data-page-heading>${title}</h1>
          <p class="page-copy page-copy--lead">${description}</p>
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
}
