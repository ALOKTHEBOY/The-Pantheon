import { cartStore } from '../store/cartStore.js';

export function Checkout() {
  return `
    <div style="max-width: 600px; margin: 0 auto; background: var(--color-surface); padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <h2 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">Checkout</h2>
      
      <form id="checkout-form" style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
        <div>
          <label for="name" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500;">Full Name</label>
          <input type="text" id="name" required style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        </div>
        
        <div>
          <label for="email" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500;">Email Address</label>
          <input type="email" id="email" required style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        </div>
        
        <div>
          <label for="address" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500;">Shipping Address</label>
          <textarea id="address" required rows="3" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md);"></textarea>
        </div>
        
        <button type="submit" class="btn" style="margin-top: var(--spacing-sm); font-size: 1.1rem;">Place Order</button>
      </form>
    </div>
  `;
}

export function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    // Clear the cart upon successful order
    cartStore.clearCart();
    
    alert('Order placed successfully! Thank you for shopping with NovaCart Pro.');
    window.location.hash = '';
  });
}