import { cartStore } from '../store/cartStore.js';

export function Header() {
  const totalItems = cartStore.getTotalItems();
  const isDark = localStorage.getItem('theme') === 'dark';
  
  return `
    <header class="header">
      <div class="container flex-between">
        <h2 style="color: var(--color-primary);">NovaCart Pro</h2>
        <nav style="display: flex; align-items: center; gap: var(--spacing-md);">
          <ul class="nav-list" style="display: flex; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none;">
            <li><a href="#" class="nav-link active">Home</a></li>
            <li><a href="#products" class="nav-link">Products</a></li>
            <li><a href="#cart" class="nav-link" id="cart-count">Cart (${totalItems})</a></li>
          </ul>
          <button id="theme-toggle" class="btn" style="padding: 0.25rem 0.5rem; background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); font-size: 1.2rem; margin-left: var(--spacing-sm);">
            ${isDark ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  `;
}