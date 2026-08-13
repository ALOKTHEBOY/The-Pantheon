export function Footer() {
  return `
    <footer style="padding: 2rem; text-align: center; border-top: 1px solid var(--color-border); margin-top: auto; background: var(--color-surface);">
      <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem;">
        <a href="#/about" class="nav-link" style="color: var(--color-text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s;">About The Pantheon</a>
      </div>
      <p style="color: var(--color-text-muted); font-size: 0.85rem; margin: 0;">
        &copy; 2026 The Pantheon. All temporal and galactic rights reserved.
      </p>
    </footer>
  `;
}