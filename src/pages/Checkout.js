import { cartStore } from '../store/cartStore.js';
import { db } from '../services/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export function Checkout() {
  const total = cartStore.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartStore.items.length === 0) {
    return `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2>Your cart is empty</h2>
        <p style="color: var(--color-text-muted); margin: 1rem 0;">Add some items before checking out.</p>
        <a href="#products" class="btn" style="text-decoration: none;">Browse Products</a>
      </div>
    `;
  }

  return `
    <div style="max-width: 900px; margin: 2rem auto; display: grid; gap: 2rem; grid-template-columns: 1fr 1fr; align-items: start;">
      
      <!-- Left Column: Shipping Form -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Shipping Details</h2>
        <form id="checkout-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
          <div>
            <label style="display: block; margin-bottom: 4px;">Full Name</label>
            <input type="text" id="ship-name" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px;">Address</label>
            <textarea id="ship-address" required rows="3" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);"></textarea>
          </div>
          <button type="submit" class="btn" style="margin-top: 10px;">Place Order</button>
        </form>
      </div>

      <!-- Right Column: Order Summary -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Order Summary</h2>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${cartStore.items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
              <span>${item.name} <b>(x${item.quantity})</b></span>
              <span>₹${item.price * item.quantity}</span>
            </div>
          `).join('')}
        </div>
        <div style="border-top: 1px solid var(--color-border); padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
          <span>Total:</span>
          <span>₹${total}</span>
        </div>
      </div>

    </div>
  `;
}

export async function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Processing...';
      btn.disabled = true;

      const newOrder = {
        name: document.getElementById('ship-name').value,
        address: document.getElementById('ship-address').value,
        items: cartStore.items,
        totalAmount: cartStore.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, "orders"), newOrder);
      
      // --- THE FIX ---
      // 1. Safely empty the array without breaking the memory reference
      cartStore.items.length = 0; 
      
      // 2. Forcefully overwrite local storage with an empty array
      localStorage.setItem('cart', JSON.stringify([])); 
      
      alert("Success! Your order has been placed.");
      
      // 3. Smoothly redirect to home (removed the glitchy reload)
      window.location.hash = '#';
      
    } catch (error) {
      alert("Error placing order: " + error.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}