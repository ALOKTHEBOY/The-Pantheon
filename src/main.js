import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';

const app = document.querySelector("#app");

app.innerHTML = Layout(Home());