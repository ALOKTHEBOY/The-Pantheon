import './styles/main.css';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';

const app = document.querySelector("#app");

app.innerHTML = `
  ${Header()}
  
  <main style="flex: 1; padding: var(--spacing-md); max-width: 1200px; margin: 0 auto; width: 100%;">
    <p>Application shell styled and loaded.</p>
  </main>
  
  ${Footer()}
`;