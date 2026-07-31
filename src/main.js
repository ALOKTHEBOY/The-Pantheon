import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { Products } from './pages/Products.js';
import { Cart } from './pages/Cart.js';

const app = document.querySelector("#app");

// Define our routes mapping URL hashes to components
const routes = {
  '': Home,
  '#': Home,
  '#products': Products,
  '#cart': Cart
};

// The routing engine
function router() {
  // 1. Get the current hash from the URL
  const path = window.location.hash;
  
  // 2. Find the matching component, default to Home if invalid
  const pageComponent = routes[path] || Home;
  
  // 3. Render the layout wrapper with the selected page inside
  app.innerHTML = Layout(pageComponent());
}

// Listen for navigation clicks (hash changes)
window.addEventListener('hashchange', router);

// Run the router once when the page initially loads
window.addEventListener('DOMContentLoaded', router);