import { Header } from './Header.js';
import { Footer } from './Footer.js';

export function Layout(content) {
  return `
    ${Header()}
    <main class="container" style="flex: 1; padding-top: var(--spacing-lg); padding-bottom: var(--spacing-lg);">
      ${content}
    </main>
    ${Footer()}
  `;
}