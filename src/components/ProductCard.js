import { wishlistStore } from '../store/wishlistStore.js';

export function ProductCard(product) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountBadge = hasDiscount
    ? `<div style="position: absolute; top: 10px; left: 10px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; z-index: 1;">${product.discountPercentage}% OFF</div>`
    : '';

  // Check if item is in wishlist to show the correct heart
  const isWishlisted = wishlistStore.hasItem(product.id);
  const heartIcon = isWishlisted ? '❤️' : '🤍';

  return `
    <div class="product-card" style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface); display: flex; flex-direction: column; position: relative;">
      
      <!-- Restored Wishlist Button -->
      <button class="wishlist-toggle-btn" data-id="${product.id}" style="position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: transform 0.1s;">
        ${heartIcon}
      </button>

      <div style="position: relative; height: 200px; overflow: hidden; cursor: pointer;" onclick="window.location.hash='#product/${product.id}'">
        ${discountBadge}
        <img src="${product.image || (product.images && product.images[0])}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      
      <div style="padding: var(--spacing-md); display: flex; flex-direction: column; flex-grow: 1;">
        <h3 style="margin-bottom: var(--spacing-sm); font-size: 1.1rem;">${product.name}</h3>
        
        <div style="margin-bottom: var(--spacing-md);">
          ${hasDiscount ? `<strike style="color: var(--color-text-muted); font-size: 0.9rem;">₹${parseFloat(product.originalPrice).toFixed(2)}</strike>` : ''}
          <span style="color: var(--color-primary); font-weight: bold; font-size: 1.2rem; margin-left: 5px;">₹${parseFloat(product.price).toFixed(2)}</span>
        </div>
        
        <button class="btn add-to-cart-btn" data-id="${product.id}" style="margin-top: auto;">Add to Cart</button>
      </div>
    </div>
  `;
}