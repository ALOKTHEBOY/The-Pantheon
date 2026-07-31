import './styles/main.css';
import { Layout } from './components/Layout.js';

const app = document.querySelector("#app");

const homeContent = `<p>Application shell styled and loaded through Layout wrapper.</p>`;

app.innerHTML = Layout(homeContent);