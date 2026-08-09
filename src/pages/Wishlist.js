import { wishlistStore } from '../store/wishlistStore.js';
import { ProductCard } from '../components/ProductCard.js';

export function Wishlist() {
  const items = wishlistStore.items;

  // Empty State UI
  if (items.length === 0) {
    return `
      <div style="max-width: 800px; margin: 4rem auto; text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🤍</div>
        <h2>Your Wishlist is Empty</h2>
        <p style="color: var(--color-text-muted); margin: 1rem 0;">Save your favorite items here to buy them later.</p>
        <a href="#/products" class="btn" style="text-decoration: none; display: inline-block; padding: 12px 24px;">Discover Products</a>
      </div>
    `;
  }

  // Populated Grid UI
  return `
    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 2rem;">My Wishlist</h2>
      <div id="wishlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, 280px); gap: 2rem; justify-content: center;">
        ${items.map(item => ProductCard(item)).join('')}
      </div>
    </div>
  `;
}

export function initWishlist() {
  // Listen for the global event we dispatched in the store
  // When a user clicks a heart on this page to remove an item, it instantly re-renders the grid
  const handleWishlistUpdate = () => {
    if (window.location.hash === '#wishlist') {
      window.dispatchEvent(new Event('hashchange')); 
    }
  };

  window.addEventListener('wishlistUpdated', handleWishlistUpdate, { once: true });
}