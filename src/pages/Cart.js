import { cartStore } from '../store/cartStore.js';
import { CartItem } from '../components/CartItem.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export function Cart() {
  const hasItems = cartStore.items.length > 0;
  
  // UPGRADED EMPTY STATE
  if (!hasItems) {
    return `
      <div style="max-width: 800px; margin: 4rem auto; text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p style="color: var(--color-text-muted); margin: 1rem 0;">Looks like you haven't added anything to your cart yet.</p>
        <a href="#/products" class="btn" style="text-decoration: none; display: inline-block; padding: 12px 24px;">Start Shopping</a>
      </div>
    `;
  }

  // POPULATED CART STATE
  const itemsHTML = cartStore.items.map(item => CartItem(item)).join('');

  return `
    <div id="cart-container" style="background: var(--color-surface); padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <h2 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">Your Shopping Cart</h2>
      
      <div>
        ${itemsHTML}
      </div>

      <div class="flex-between" style="margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 2px solid var(--color-border);">
        <h3>Total:</h3>
        <h3 class="price">${formatCurrency(cartStore.getTotalPrice())}</h3>
      </div>
      <a href="#/checkout" class="btn" style="margin-top: var(--spacing-md); font-size: 1.1rem; padding: var(--spacing-md); text-align: center; text-decoration: none; display: block;">Proceed to Checkout</a>
    </div>
  `;
}

export function initCart() {
  // Safety wipe: If the user opens the actual cart, destroy any pending Buy Now overrides
  sessionStorage.removeItem('buyNowItem');

  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  cartContainer.addEventListener('click', (e) => {
    if (e.target.matches('.remove-btn')) {
      const productId = e.target.getAttribute('data-id');
      cartStore.removeFromCart(productId);
      
      // Force the router to re-render the current view
      window.dispatchEvent(new Event('hashchange'));
    }
  });
}