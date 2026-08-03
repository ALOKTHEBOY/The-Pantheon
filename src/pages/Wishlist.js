import { wishlistStore } from '../store/wishlistStore.js';
import { ProductCard } from '../components/ProductCard.js';

export function Wishlist() {
  const items = wishlistStore.items;

  if (items.length === 0) {
    return `
      <div style="text-align: center; padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-sm);">Your Wishlist is empty</h2>
        <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-md);">Save items you love to view them later.</p>
        <a href="#products" class="btn" style="display: inline-block; text-decoration: none;">Browse Products</a>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">My Wishlist</h2>
      <div class="grid grid-cols-2 grid-cols-4" style="gap: var(--spacing-md);">
        ${items.map(product => ProductCard(product)).join('')}
      </div>
    </div>
  `;
}

export function initWishlist() {
  // The global click listener handles the heart toggle buttons, 
  // but if a user removes an item while ON the wishlist page, we should re-render it.
  const container = document.querySelector('#app');
  
  container.addEventListener('click', (e) => {
    if (e.target.closest('.wishlist-toggle-btn') && window.location.hash === '#wishlist') {
      // Small delay to let the store update first, then refresh the view
      setTimeout(() => {
        window.dispatchEvent(new Event('hashchange'));
      }, 50);
    }
  });
}