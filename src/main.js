import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { Products, initProducts } from './pages/Products.js';
import { Cart } from './pages/Cart.js';
import { products } from './utils/data.js';
import { cartStore } from './store/cartStore.js';

const app = document.querySelector("#app");

const routes = {
  '': { render: Home },
  '#': { render: Home },
  '#products': { render: Products, init: initProducts },
  '#cart': { render: Cart }
};

function router() {
  const path = window.location.hash;
  const route = routes[path] || routes[''];
  
  app.innerHTML = Layout(route.render());
  
  if (route.init) {
    route.init();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Global Event Delegation for Add to Cart
document.addEventListener('click', (e) => {
  // Check if the clicked element has our specific button class
  if (e.target.matches('.add-to-cart-btn')) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (product) {
      cartStore.addToCart(product);
    }
  }
});

// Listen for Cart Updates and modify the DOM
window.addEventListener('cartUpdated', () => {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = `Cart (${cartStore.getTotalItems()})`;
  }
});