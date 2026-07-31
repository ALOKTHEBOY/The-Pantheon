import { cartStore } from '../store/cartStore.js';
import { CartItem } from '../components/CartItem.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export function Cart() {
  const hasItems = cartStore.items.length > 0;
  
  const itemsHTML = hasItems 
    ? cartStore.items.map(item => CartItem(item)).join('')
    : `<p style="padding: var(--spacing-lg) 0; text-align: center; color: var(--color-text-muted);">Your cart is currently empty.</p>`;

  return `
    <div id="cart-container" style="background: var(--color-surface); padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <h2 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">Your Shopping Cart</h2>
      
      <div>
        ${itemsHTML}
      </div>

      ${hasItems ? `
        <div class="flex-between" style="margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 2px solid var(--color-border);">
          <h3>Total:</h3>
          <h3 class="price">${formatCurrency(cartStore.getTotalPrice())}</h3>
        </div>
        <button class="btn" style="margin-top: var(--spacing-md); font-size: 1.1rem; padding: var(--spacing-md);">Proceed to Checkout</button>
      ` : ''}
    </div>
  `;
}

export function initCart() {
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  cartContainer.addEventListener('click', (e) => {
    if (e.target.matches('.remove-btn')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      cartStore.removeFromCart(productId);
      
      // Force the router to re-render the current view
      window.dispatchEvent(new Event('hashchange'));
    }
  });
}