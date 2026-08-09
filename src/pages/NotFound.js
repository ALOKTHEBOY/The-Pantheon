export function NotFound() {
  return `
    <div style="max-width: 800px; margin: 4rem auto; text-align: center; padding: 2rem;">
      <div style="font-size: 5rem; margin-bottom: 1rem;">🔍</div>
      <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--color-text-main);">404 - Page Not Found</h1>
      <p style="color: var(--color-text-muted); margin: 1rem 0 2rem 0; font-size: 1.1rem;">
        Oops! We couldn't find the page you were looking for. It might have been moved, deleted, or you might have mistyped the URL.
      </p>
      <a href="#/" class="btn" style="text-decoration: none; display: inline-block; padding: 12px 24px; font-size: 1.1rem;">Return to Home</a>
    </div>
  `;
}