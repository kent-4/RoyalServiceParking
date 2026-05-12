export function renderPublicFooter() {
  return `
    <footer class="public-footer">
      <div class="public-footer__inner">
        <div class="public-footer__brand">
          <strong>Royal Service Parking</strong>
          <p>
            Advance reservation and parking-operations access for a single
            facility, rebuilt in plain JavaScript and backed by Spring Boot.
          </p>
          <p class="public-footer__meta">
            Verified account required for customer booking. Shared login routes
            customers, cashiers, and administrators into the correct workspace.
          </p>
        </div>
        <div class="public-footer__column">
          <span class="public-footer__title">Customer journey</span>
          <nav class="public-footer__links" aria-label="Customer">
            <a href="/" data-link>Home</a>
            <a href="/register" data-link>Register</a>
            <a href="/login" data-link>Login</a>
            <a href="/forgot-password" data-link>Reset password</a>
          </nav>
        </div>
        <div class="public-footer__column">
          <span class="public-footer__title">Staff access</span>
          <nav class="public-footer__links" aria-label="Staff">
            <a href="/login?role=cashier" data-link>Cashier portal</a>
            <a href="/login?role=admin" data-link>Admin portal</a>
          </nav>
        </div>
      </div>
    </footer>
  `;
}
