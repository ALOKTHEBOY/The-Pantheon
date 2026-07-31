import { Header } from './Header.js';
import { Footer } from './Footer.js';

export function Layout(content) {
  return `
    ${Header()}
    <main style="flex: 1; padding: var(--spacing-md); max-width: 1200px; margin: 0 auto; width: 100%;">
      ${content}
    </main>
    ${Footer()}
  `;
}