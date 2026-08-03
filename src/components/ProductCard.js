import { formatCurrency } from '../utils/formatCurrency.js';
import { wishlistStore } from '../store/wishlistStore.js';

export function ProductCard(product) {
  const isWishlisted = wishlistStore.hasItem(product.id);
  const heartIcon = isWishlisted ? '❤️' : '🤍';

  return `
    <div class="product-card" style="position: relative;">
      <button class="wishlist-toggle-btn" data-id="${product.id}" style="position: absolute; top: var(--spacing-sm); right: var(--spacing-sm); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 50%; padding: 0.5rem; cursor: pointer; z-index: 2; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${heartIcon}
      </button>
      <a href="#product/${product.id}" style="text-decoration: none; color: inherit; display: block;">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h4>${product.name}</h4>
      </a>
      <p class="price">${formatCurrency(product.price)}</p>
      <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
}