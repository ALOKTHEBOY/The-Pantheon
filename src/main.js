import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { Products, initProducts } from './pages/Products.js';
import { Cart, initCart } from './pages/Cart.js';
import { products } from './utils/data.js';
import { cartStore } from './store/cartStore.js';
// Add this to your imports at the top
import { Checkout, initCheckout } from './pages/Checkout.js';
import { ProductDetails } from './pages/ProductDetails.js';
import { showToast } from './utils/toast.js';

const app = document.querySelector("#app");

// Update the routes object
const routes = {
  '': { render: Home },
  '#': { render: Home },
  '#products': { render: Products, init: initProducts },
  '#cart': { render: Cart, init: initCart },
  '#checkout': { render: Checkout, init: initCheckout } // <-- Added Checkout route
};

// ... (keep the routes object exactly the same) ...

function router() {
  const path = window.location.hash;
  
  // NEW: Check for dynamic product route
  if (path.startsWith('#product/')) {
    const productId = path.split('/')[1]; // Extracts the "1" from "#product/1"
    app.innerHTML = Layout(ProductDetails(productId));
    return; // Exit the router early so it doesn't look for static routes
  }

  // Existing static route logic
  const route = routes[path] || routes[''];
  
  app.innerHTML = Layout(route.render());
  
  if (route.init) {
    route.init();
  }
}

// ... (keep event listeners and cart delegation exactly the same) ...

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Global Event Delegation for Add to Cart
document.addEventListener('click', (e) => {
  if (e.target.matches('.add-to-cart-btn')) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (product) {
      cartStore.addToCart(product);
      showToast(`${product.name} added to cart!`); // <-- Trigger the notification
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