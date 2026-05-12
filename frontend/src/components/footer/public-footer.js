export function renderPublicFooter() {
  return `
    <footer class="public-footer">
      <div class="public-footer__inner">
        <div class="public-footer__brand">
          <strong>Royal Service Parking</strong>
          <p>
            Advance reservation and parking-operations access for one parking
            facility, rebuilt in plain JavaScript and backed by Spring Boot.
          </p>
          <p class="public-footer__meta">
            Verified customer access, a visible 1-hour arrival rule, and one
            shared sign-in flow for returning accounts.
          </p>
        </div>
        <div class="public-footer__column">
          <span class="public-footer__title">Explore</span>
          <nav class="public-footer__links" aria-label="Explore">
            <a href="/" data-link>Home</a>
            <a href="/register" data-link>Register</a>
            <a href="/login" data-link>Login</a>
            <a href="/forgot-password" data-link>Reset password</a>
          </nav>
        </div>
      </div>
    </footer>
  `;
}
