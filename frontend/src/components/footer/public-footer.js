export function renderPublicFooter() {
  return `
    <footer class="public-footer">
      <div class="public-footer__inner">
        <div>
          <strong>Royal Service Parking</strong>
          <p>
            Plain JavaScript rebuild backed by Spring Boot for bookings, auth,
            notifications, and parking operations.
          </p>
        </div>
        <nav class="public-footer__links" aria-label="Footer">
          <a href="/" data-link>Home</a>
          <a href="/register" data-link>Register</a>
          <a href="/login" data-link>Login</a>
          <a href="/login?role=cashier" data-link>Cashier</a>
          <a href="/login?role=admin" data-link>Admin</a>
        </nav>
      </div>
    </footer>
  `;
}
