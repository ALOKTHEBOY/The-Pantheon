// --- 1. IMPORTS ---
// Core & Utils
import './styles/main.css';
import { Layout } from './components/Layout.js';
import { showToast } from './utils/toast.js';
import { getProductById } from './services/api.js';

// Pages
import { Home, initHome } from './pages/Home.js';
import { Products, initProducts } from './pages/Products.js';
import { Cart, initCart } from './pages/Cart.js';
import { Checkout, initCheckout } from './pages/Checkout.js';
import { ProductDetails, initProductDetails } from './pages/ProductDetails.js';
import { Wishlist, initWishlist } from './pages/Wishlist.js';
import { Login, initLogin } from './pages/Login.js';
import { Register, initRegister } from './pages/Register.js';
import { About, initAbout } from './pages/About.js';
import { NotFound } from './pages/NotFound.js'; // NEW: 404 Page

// Stores
import { cartStore } from './store/cartStore.js';
import { wishlistStore } from './store/wishlistStore.js';
import { authStore } from './store/authStore.js';
import { notificationStore } from './store/notificationStore.js';
import { settingsStore } from './store/settingsStore.js';

// Components
import { Dropdown, initDropdowns } from './components/Dropdown.js';

// Dashboard Overview
import { DashboardOverview, initDashboardOverview } from './pages/Dashboard/Overview.js';
import { DashboardOrders, initDashboardOrders } from './pages/Dashboard/Orders.js';
import { DashboardSettings, initDashboardSettings } from './pages/Dashboard/Settings.js';
import { DashboardAnalytics, initDashboardAnalytics } from './pages/Dashboard/Analytics.js';
import { DashboardProductList, initDashboardProductList } from './pages/Dashboard/ProductList.js';
import { DashboardProductForm, initDashboardProductForm } from './pages/Dashboard/ProductForm.js';
import { ManageHome, initManageHome } from './pages/Dashboard/ManageHome.js';

// Profile Subpages
import { ProfileInfo, initProfileInfo } from './pages/Profile/Info.js';
import { ProfileHistory, initProfileHistory } from './pages/Profile/History.js';
import { ProfileSettings, initProfileSettings } from './pages/Profile/Settings.js';

// --- 2. INITIALIZATION ---
authStore.init(); // Starts listening to Firebase user session
const app = document.querySelector("#app");

// --- 3. ROUTER CONFIGURATION ---
const routes = {
  '': { render: Home, init: initHome },
  '#/': { render: Home, init: initHome },
  '#/products': { render: Products, init: initProducts },
  '#/wishlist': { render: Wishlist, init: initWishlist },
  '#/cart': { render: Cart, init: initCart },
  '#/checkout': { render: Checkout, init: initCheckout },
  '#/login': { render: Login, init: initLogin },
  '#/register': { render: Register, init: initRegister },
  '#/about': { render: About, init: initAbout },
  
  // Modular Profile Routes
  '#/profile': { render: ProfileInfo, init: initProfileInfo },
  '#/profile/orders': { render: ProfileHistory, init: initProfileHistory }, // NEW: Order History Module
  '#/profile/settings': { render: ProfileSettings, init: initProfileSettings }, // FINAL: Settings Module
  
  // FINAL: Modular Dashboard Routes
  '#/dashboard': { render: DashboardOverview, init: initDashboardOverview },
  '#/dashboard/analytics': { render: DashboardAnalytics, init: initDashboardAnalytics },
  '#/dashboard/products': { render: DashboardProductList, init: initDashboardProductList },
  '#/dashboard/products/add': { render: DashboardProductForm, init: () => initDashboardProductForm(null) },
  '#/dashboard/orders': { render: DashboardOrders, init: initDashboardOrders }, 
  '#/dashboard/settings': { render: DashboardSettings, init: initDashboardSettings },
  '#/dashboard/home': { render: ManageHome, init: initManageHome },
};


// Helper: Highlights the active link in the navigation bar
function updateActiveNavLink(currentPath) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.classList.remove('active');
    const targetPath = currentPath === '' ? '#/' : currentPath;
    if (link.getAttribute('href') === targetPath) {
      link.classList.add('active');
    }
  });
}

// Core Router Logic
function router() {
  let fullHash = window.location.hash;
  // NEW: Strip off query parameters so the router only reads the base path (e.g., '#/products')
  let path = fullHash.split('?')[0]; 
  
  if (path === '#' || path === '') path = '#/';
  
  // Handle Dynamic Product Details Route (Customer View)
  if (path.startsWith('#/product/')) {
    const productId = path.split('/')[2]; 
    app.innerHTML = Layout(ProductDetails()); 
    initProductDetails(productId); 
    updateActiveNavLink('#/products'); 
    return; 
  }

  // NEW: Catch Admin Edit Product Route (Admin View)
  if (path.startsWith('#/dashboard/products/edit/')) {
    const productId = path.split('/').pop(); // Extracts the ID from the URL
    app.innerHTML = Layout(DashboardProductForm()); // Render the Form
    initDashboardProductForm(productId); // Initialize with the ID so it fetches data
    return; 
  }

  // Handle Protected Routes (Security Check)
  if ((path.startsWith('#/profile') || path.startsWith('#/dashboard')) && !authStore.user) {
    window.location.hash = '#/login'; 
    return; 
  }

  // Admin-only Route Protection
  const adminEmail = 'alokb7837@gmail.com'; 
  if (path.startsWith('#/dashboard') && authStore.user.email !== adminEmail) {
    alert("Access Denied: Admins Only");
    window.location.hash = '#/'; 
    return;
  }

  // Handle Standard Routes (If the path isn't in the routes object, render the 404 page)
  const route = routes[path] || { render: NotFound, init: null };
  app.innerHTML = Layout(route.render());
  
  if (route.init) {
    route.init();
  }

  updateActiveNavLink(path);
}

// --- 4. GLOBAL EVENT LISTENERS ---
// Triggers router when the URL hash changes
window.addEventListener('hashchange', router);

// Initial page load setup
window.addEventListener('DOMContentLoaded', () => {
  router();
  window.dispatchEvent(new CustomEvent('cartUpdated')); 
  initDropdowns(); 
  
  // Smart Theme Initialization
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});

// Updates the header cart badge dynamically
window.addEventListener('cartUpdated', () => {
  const cartIcon = document.getElementById('mobile-cart-icon');
  if (cartIcon) {
    const total = cartStore.getTotalItems();
    let badge = document.getElementById('cart-badge');
    
    if (total > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'cart-badge';
        badge.style.cssText = 'position: absolute; top: -6px; right: -8px; background: var(--color-primary); color: white; border-radius: 50%; font-size: 0.65rem; padding: 2px 6px; font-weight: bold;';
        cartIcon.appendChild(badge);
      }
      badge.textContent = total;
    } else if (badge) {
      badge.remove();
    }
  }
});

// Updates the notification bell and dropdown dynamically
window.addEventListener('notificationsUpdated', () => {
  const bellBtn = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  
  if (bellBtn && dropdown) {
    // 1. Update the Red Badge
    const unreadCount = notificationStore.getUnreadCount();
    let badge = bellBtn.querySelector('span');
    
    if (unreadCount > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; font-size: 0.6rem; padding: 2px 5px; font-weight: bold;';
        bellBtn.appendChild(badge);
      }
      badge.textContent = unreadCount;
    } else if (badge) {
      badge.remove();
    }

    // 2. Update the Dropdown List HTML
    const listHtml = notificationStore.notifications.length > 0 
      ? notificationStore.notifications.map(n => `
          <div style="padding: 10px; border-bottom: 1px solid var(--color-border); opacity: ${n.read ? '0.6' : '1'}; transition: opacity 0.3s;">
            <div style="font-size: 0.9rem; color: var(--color-text-main);">${n.text}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">${n.time}</div>
          </div>
        `).join('')
      : '<div style="padding: 15px; font-size: 0.9rem; color: var(--color-text-muted); text-align: center;">No notifications yet.</div>';
    
    dropdown.innerHTML = `
      <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid var(--color-border);">Notifications</div>
      <div style="max-height: 300px; overflow-y: auto;">${listHtml}</div>
    `;
  }
});

// Refreshes the view when a user logs in or out
window.addEventListener('authStateChanged', async () => {
  // NEW: Fetch the user's saved wishlist from Firebase before rendering
  await wishlistStore.loadWishlist(); 
  
  window.dispatchEvent(new Event('hashchange')); 
});

// --- 5. GLOBAL CLICK DELEGATION ---
// Handles all click interactions efficiently at the document level
document.addEventListener('click', async (e) => {

  // Mobile Hamburger Menu Toggle
  if (e.target.closest('#mobile-menu-toggle')) {
    const navList = document.getElementById('main-nav-list');
    if (navList) {
      navList.classList.toggle('mobile-open');
    }
    return;
  }

  // Auto-close mobile menu when a navigation link is clicked
  if (e.target.closest('.nav-link')) {
    const navList = document.getElementById('main-nav-list');
    if (navList && navList.classList.contains('mobile-open')) {
      navList.classList.remove('mobile-open');
    }
  }
  
  // NEW: Dropdown Theme Selector Logic
  if (e.target.getAttribute('href')?.startsWith('#/theme/')) {
    e.preventDefault();
    const mode = e.target.getAttribute('href').split('/')[2];
    
    if (mode === 'light') {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else if (mode === 'system') {
      localStorage.removeItem('theme');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
    
    // Close the dropdown and nav menu after selecting
    document.getElementById('main-nav-list')?.classList.remove('mobile-open');
    document.querySelectorAll('.dropdown-wrapper').forEach(d => d.classList.remove('is-active'));
    showToast(`Theme changed to ${mode}`);
    return;
  }

  // Wishlist Toggle Logic
  if (e.target.closest('.wishlist-toggle-btn')) {
    const button = e.target.closest('.wishlist-toggle-btn');
    const productId = button.getAttribute('data-id');
    const product = await getProductById(productId);
    
    if (product) {
      wishlistStore.toggle(product);
      const isNowWishlisted = wishlistStore.hasItem(productId);
      button.textContent = isNowWishlisted ? '❤️' : '🤍';
      showToast(isNowWishlisted ? 'Added to Wishlist!' : 'Removed from Wishlist');
    }
    return; 
  }

  // UPDATED: Logout Logic (Now catches the dropdown link instead of a button ID)
  if (e.target.getAttribute('href') === '#/logout') {
    e.preventDefault(); // Prevents the router from trying to load a '#logout' page
    authStore.logout();
    return;
  }
  
  // Add to Cart Logic
  if (e.target.matches('.add-to-cart-btn')) {
    const button = e.target;
    const originalText = button.textContent;
    
    button.textContent = 'Adding...';
    button.disabled = true;

    const productId = button.getAttribute('data-id');
    const product = await getProductById(productId); 
    
    if (product) {
      settingsStore.playSound('cart'); // Play Sound!
      cartStore.addToCart(product);
      showToast(`${product.name} added to cart!`);
    }

    button.textContent = originalText;
    button.disabled = false;
  }

  // Notification Bell Toggle Logic (BUG FIXED: Removed page refresh)
  if (e.target.closest('#notification-bell')) {
    const dropdown = document.getElementById('notification-dropdown');
    const bellBtn = e.target.closest('#notification-bell');
    const isHidden = dropdown.style.display === 'none';
    
    dropdown.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden && notificationStore.getUnreadCount() > 0) {
      notificationStore.markAllAsRead(); // Updates data state
      
      // Removes the red badge from the UI instantly without reloading the page
      const badge = bellBtn.querySelector('span');
      if (badge) badge.remove(); 
    }
    return;
  }
  
  // Close Notification Dropdown if clicking anywhere else on the screen
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown && dropdown.style.display === 'block' && !e.target.closest('#notification-dropdown') && !e.target.closest('#notification-bell')) {
    dropdown.style.display = 'none';
  }
});