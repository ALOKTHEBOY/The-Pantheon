import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';
import { notificationStore } from '../store/notificationStore.js';
import { Dropdown } from './Dropdown.js';

export function Header() {
  const totalItems = cartStore.getTotalItems();
  
  // 1. Generate Dashboard Dropdown
  const dashboardMenu = authStore.user && authStore.user.email === 'alokb7837@gmail.com'
    ? `<li>
        ${Dropdown({
          id: 'dashboard',
          label: 'Dashboard',
          items: [
            { label: 'Overview', link: '#/dashboard' },
            { label: 'Manage Homepage', link: '#/dashboard/home' },
            { label: 'Manage Products', link: '#/dashboard/products' },
            { label: 'Store Orders', link: '#/dashboard/orders' },
            { label: 'Analytics', link: '#/dashboard/analytics' },
            { label: 'Settings', link: '#/dashboard/settings' }
          ]
        })}
       </li>`
    : '';

  const firstName = authStore.user?.displayName 
    ? authStore.user.displayName.split(' ')[0] 
    : 'User';

  // 2. Generate User Dropdown 
  const userMenu = authStore.user
    ? `<li>
        ${Dropdown({
          id: 'user',
          label: `Hi, ${firstName}`,
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

  // 3. NEW: Generate Theme Dropdown
  const themeMenu = `<li>
    ${Dropdown({
      id: 'theme',
      label: 'Theme',
      items: [
        { label: 'Light Mode', link: '#/theme/light' },
        { label: 'Dark Mode', link: '#/theme/dark' },
        { label: 'System Auto', link: '#/theme/system' }
      ]
    })}
  </li>`;

  return `
    <header class="header" style="position: sticky; top: 0; z-index: 1000; background: var(--color-surface); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);">
      <div class="container flex-between">
        
        <!-- Left Side: Hamburger & Logo -->
        <div style="display: flex; align-items: center; gap: 15px;">
          <button id="mobile-menu-toggle" class="mobile-menu-btn">☰</button>
          <a href="#/" style="text-decoration: none;">
            <h2 style="
              margin: 0; 
              font-family: 'Georgia', serif; 
              letter-spacing: 2px; 
              text-transform: uppercase;
              background: linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #db2777 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 800;
              font-size: 1.5rem;
            ">
              The Pantheon
            </h2>
          </a>
        </div>
        
        <!-- Center: Navigation (Cart text removed) -->
        <nav style="display: flex; align-items: center; gap: var(--spacing-md);">
          <ul id="main-nav-list" class="nav-list">
            <li><a href="#/" class="nav-link active">Home</a></li>
            <li><a href="#/products" class="nav-link">Products</a></li>
            <li><a href="#/wishlist" class="nav-link">Wishlist</a></li>
            ${dashboardMenu}
            ${userMenu}
            ${themeMenu}
          </ul>
          
          <!-- Right Side: Always-Visible Premium Icons -->
          <div style="display: flex; align-items: center; gap: 18px; margin-left: 10px;">
            
            <div style="position: relative;">
              <button id="notification-bell" style="background: none; border: none; cursor: pointer; font-size: 1.4rem; position: relative; padding: 0;">
                🔔
                ${notificationStore.getUnreadCount() > 0 ? `<span style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; font-size: 0.6rem; padding: 2px 5px; font-weight: bold;">${notificationStore.getUnreadCount()}</span>` : ''}
              </button>
              
              <div id="notification-dropdown" style="display: none; position: absolute; right: 0; top: 100%; width: 280px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; margin-top: 15px; text-align: left;">
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
            </div>

            <!-- Premium Cart Icon -->
            <a href="#/cart" id="mobile-cart-icon" style="
              position: relative; 
              text-decoration: none; 
              font-size: 1.3rem; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              width: 40px;
              height: 40px;
              background: var(--color-surface);
              border: 1px solid var(--color-border);
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              transition: transform 0.2s;
            ">
              🛒
              ${totalItems > 0 ? `<span id="cart-badge" style="position: absolute; top: -4px; right: -4px; background: linear-gradient(135deg, #ef4444, #db2777); color: white; border-radius: 50%; font-size: 0.65rem; padding: 2px 6px; font-weight: bold; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);">${totalItems}</span>` : ''}
            </a>

          </div>
        </nav>
      </div>
    </header>
  `;
}