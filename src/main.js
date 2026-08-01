import './styles/main.css';
import { Layout } from './components/Layout.js';
import { Home, initHome } from './pages/Home.js';
import { Products, initProducts } from './pages/Products.js';
import { Cart, initCart } from './pages/Cart.js';
import { Checkout, initCheckout } from './pages/Checkout.js';
import { ProductDetails, initProductDetails } from './pages/ProductDetails.js'; // <-- Updated
import { cartStore } from './store/cartStore.js';
import { showToast } from './utils/toast.js';
import { getProductById } from './services/api.js'; // <-- New import

const app = document.querySelector("#app");

const routes = {
  '': { render: Home, init: initHome },
  '#': { render: Home, init: initHome },
  '#products': { render: Products, init: initProducts },
  '#cart': { render: Cart, init: initCart },
  '#checkout': { render: Checkout, init: initCheckout }
};

function updateActiveNavLink(currentPath) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.classList.remove('active');
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
    app.innerHTML = Layout(ProductDetails()); // <-- Removed ID from here
    initProductDetails(productId); // <-- Added init call here
    updateActiveNavLink('#products'); 
    return; 
  }

  const route = routes[path] || routes[''];
  
  app.innerHTML = Layout(route.render());
  
  if (route.init) {
    route.init();
  }

  updateActiveNavLink(path);
}

// ... (keep routes and router functions above this exactly the same)

window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  router();
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  // Apply saved theme on initial load
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

window.addEventListener('cartUpdated', () => {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = `Cart (${cartStore.getTotalItems()})`;
  }
});

// Global Event Delegation for Clicks
document.addEventListener('click', async (e) => {
  
  // 1. Theme Toggle Logic
  if (e.target.closest('#theme-toggle')) {
    const toggleBtn = e.target.closest('#theme-toggle');
    document.body.classList.toggle('dark-mode');
    
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update the icon
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    return; // Exit early
  }

  // 2. Add to Cart Logic
  if (e.target.matches('.add-to-cart-btn')) {
    const button = e.target;
    const originalText = button.textContent;
    
    button.textContent = 'Adding...';
    button.disabled = true;

    const productId = parseInt(button.getAttribute('data-id'));
    const product = await getProductById(productId); 
    
    if (product) {
      cartStore.addToCart(product);
      showToast(`${product.name} added to cart!`);
    }

    button.textContent = originalText;
    button.disabled = false;
  }
});