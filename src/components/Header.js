import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';
import { notificationStore } from '../store/notificationStore.js';
import { Dropdown } from './Dropdown.js'; // NEW: Import our reusable component

export function Header() {
  const totalItems = cartStore.getTotalItems();
  const isDark = localStorage.getItem('theme') === 'dark';

  // 1. Generate Dashboard Dropdown
  const dashboardMenu = authStore.user && authStore.user.email === 'alokb7837@gmail.com'
    ? `<li>
        ${Dropdown({
          id: 'dashboard',
          label: 'Dashboard',
          items: [
            { label: 'Overview', link: '#/dashboard' },
            { label: 'Manage Products', link: '#/dashboard/products' },
            { label: 'Store Orders', link: '#/dashboard/orders' },
            { label: 'Analytics', link: '#/dashboard/analytics' },
            { label: 'Settings', link: '#/dashboard/settings' }
          ]
        })}
       </li>`
    : '';

  // 2. Generate User Dropdown 
  const userMenu = authStore.user
    ? `<li>
        ${Dropdown({
          id: 'user',
          label: `Hi, ${authStore.user.displayName || 'User'}`,
          items: [
            { label: 'My Profile', link: '#/profile' },
            { label: 'Order History', link: '#/profile/orders' },
            { label: 'Wishlist', link: '#/wishlist' },
            { label: 'Account Settings', link: '#/profile/settings' },
            { label: 'Logout', link: '#/logout' }
          ]
        })}
       </li>`
    : `<li><a href="#/login" class="nav-link" style="font-weight: bold; color: var(--color-primary);">Login</a></li>`;

  return `
    <header class="header">
      <div class="container flex-between">
        <h2 style="color: var(--color-primary);">NovaCart Pro</h2>
        <nav style="display: flex; align-items: center; gap: var(--spacing-md);">
          <ul class="nav-list" style="display: flex; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; align-items: center;">
            <li><a href="#/" class="nav-link active">Home</a></li>
            <li><a href="#/products" class="nav-link">Products</a></li>
            <li><a href="#/wishlist" class="nav-link">Wishlist</a></li>
            
            ${dashboardMenu}
            ${userMenu}
            
            <li style="position: relative;">
              <button id="notification-bell" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; position: relative;">
                🔔
                ${notificationStore.getUnreadCount() > 0 ? `<span style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; font-size: 0.6rem; padding: 2px 5px;">${notificationStore.getUnreadCount()}</span>` : ''}
              </button>
              
              <div id="notification-dropdown" style="display: none; position: absolute; right: 0; top: 100%; width: 280px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; margin-top: 10px; text-align: left;">
                <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid var(--color-border);">Notifications</div>
                <div>
                  ${notificationStore.notifications.map(n => `
                    <div style="padding: 10px; border-bottom: 1px solid var(--color-border); opacity: ${n.read ? '0.6' : '1'};">
                      <div style="font-size: 0.9rem; color: var(--color-text-main);">${n.text}</div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">${n.time}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </li>

            <li><a href="#/cart" class="nav-link" id="cart-count">Cart (${totalItems})</a></li>
          </ul>
          <button id="theme-toggle" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-left: 10px;">
            🌙
          </button>
        </nav>
      </div>
    </header>
  `;
}