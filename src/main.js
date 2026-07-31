import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { Products, initProducts } from './pages/Products.js';
import { Cart } from './pages/Cart.js';

const app = document.querySelector("#app");

// Upgrade routes to hold both the render function and an optional init function
const routes = {
  '': { render: Home },
  '#': { render: Home },
  '#products': { render: Products, init: initProducts },
  '#cart': { render: Cart }
};

function router() {
  const path = window.location.hash;
  const route = routes[path] || routes[''];
  
  // 1. Render the HTML
  app.innerHTML = Layout(route.render());
  
  // 2. Execute the initialization logic if it exists
  if (route.init) {
    route.init();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);