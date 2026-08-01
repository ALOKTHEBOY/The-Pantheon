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

// ... (keep imports and routes object exactly the same) ...

function updateActiveNavLink(currentPath) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.classList.remove('active');
    // Default empty path to '#' for the Home link
    const targetPath = currentPath === '' ? '#' : currentPath;
    if (link.getAttribute('href') === targetPath) {
      link.classList.add('active');
    }
  });
}

function router() {
  const path = window.location.hash;
  
  if (path.startsWith('#product/')) {
    const productId = path.split('/')[1]; 
    app.innerHTML = Layout(ProductDetails(productId));
    updateActiveNavLink('#products'); // Keep Products highlighted when viewing a detail page
    return; 
  }

  const route = routes[path] || routes[''];
  app.innerHTML = Layout(route.render());
  
  if (route.init) {
    route.init();
  }

  // Update the navigation highlighting
  updateActiveNavLink(path);
}

window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  router();
  // BUG FIX: Manually trigger the cart update event on first load so the header syncs with localStorage
  window.dispatchEvent(new CustomEvent('cartUpdated'));
});

// ... (keep Global Event Delegation listener exactly the same) ...

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