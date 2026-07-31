import './styles/main.css';

const app = document.querySelector("#app");

app.innerHTML = `
  <header style="padding: var(--spacing-md); background: var(--color-surface); border-bottom: 1px solid var(--color-border);">
    <h2>NovaCart Pro</h2>
  </header>
  
  <main style="flex: 1; padding: var(--spacing-md); max-width: 1200px; margin: 0 auto; width: 100%;">
    <p>Application shell styled and loaded.</p>
  </main>
  
  <footer style="padding: var(--spacing-md); text-align: center; color: var(--color-text-muted);">
    <small>© 2026 NovaCart</small>
  </footer>
`;