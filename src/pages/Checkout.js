import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';
import { db } from '../services/firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { notificationStore } from '../store/notificationStore.js';
import { settingsStore } from '../store/settingsStore.js';

export function Checkout() {
  const buyNowData = sessionStorage.getItem('buyNowItem');
  const items = buyNowData ? [JSON.parse(buyNowData)] : (cartStore.items || []);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // NEW: Pull saved address from local storage
  const savedAddress = JSON.parse(localStorage.getItem('pantheon_address')) || {};

  if (items.length === 0) {
    return `
      <div style="max-width: 800px; margin: 4rem auto; text-align: center;">
        <h2>Your cart is empty</h2>
        <p style="color: var(--color-text-muted); margin: 1rem 0;">Add some products before proceeding to checkout.</p>
        <a href="#/products" class="btn" style="text-decoration: none; display: inline-block;">Browse Products</a>
      </div>
    `;
  }

  return `
    <style>
      .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
      .checkout-form { order: 1; }
      .checkout-summary { order: 2; }
      @media (max-width: 768px) {
        .checkout-grid { grid-template-columns: 1fr; }
        .checkout-summary { order: 1; margin-bottom: 1rem; }
        .checkout-form { order: 2; }
      }
    </style>
    
    <div class="checkout-grid" style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
      
      <!-- Shipping Form -->
      <div class="checkout-form" style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Shipping Details</h2>
        <form id="checkout-form" style="display: flex; flex-direction: column; gap: 1rem;">
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Full Name</label>
            <input type="text" id="ship-name" required value="${authStore.user?.displayName || savedAddress.fullName || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Phone Number</label>
            <input type="tel" id="ship-phone" required placeholder="+91" value="${savedAddress.phone || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>

          <div>
            <label style="display: block; margin-bottom: 4px;">Delivery Address</label>
            <textarea id="ship-address" required rows="2" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">${savedAddress.address || ''}</textarea>
          </div>

          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px;">City</label>
              <input type="text" id="ship-city" required value="${savedAddress.city || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px;">Zip Code</label>
              <input type="text" id="ship-zip" required value="${savedAddress.zipCode || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
          </div>

          <button type="submit" class="btn" style="margin-top: 1rem;">Place Order</button>
        </form>
      </div>

      <!-- Order Summary -->
      <div class="checkout-summary" style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Order Summary</h2>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;">
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
              <span>${item.name} <strong>(x${item.quantity})</strong></span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
          <span>Total:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>

    </div>
  `;
}

export function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authStore.user) {
      alert("Please log in to place an order.");
      window.location.hash = '#/login';
      return;
    }

    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Processing...';
      btn.disabled = true;

      // Re-check the override right before saving to the database
      const buyNowData = sessionStorage.getItem('buyNowItem');
      const items = buyNowData ? [JSON.parse(buyNowData)] : (cartStore.items || []);
      const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderData = {
        userId: authStore.user.uid,
        email: authStore.user.email,
        items: items,
        totalAmount: orderTotal,
        createdAt: new Date().toISOString(),
        status: 'pending',
        shippingDetails: {
          fullName: document.getElementById('ship-name').value,
          phone: document.getElementById('ship-phone').value,
          address: document.getElementById('ship-address').value,
          city: document.getElementById('ship-city').value,
          zipCode: document.getElementById('ship-zip').value
        }
      };

      // NEW: Save address for next time
      localStorage.setItem('pantheon_address', JSON.stringify(orderData.shippingDetails));

      await addDoc(collection(db, "orders"), orderData);
      
      // If it was a Buy Now order, just clear the override. If not, empty the cart.
      if (buyNowData) {
        sessionStorage.removeItem('buyNowItem');
      } else {
        cartStore.clearCart();
      }
      
      // Fire the notification AND the success sound together!
      notificationStore.addNotification('🎉 Order placed successfully! Check your history for details.', 'success');
      
      // NEW: Add a 1.5-second delay so the user hears the sound and reads the notification before the page redirects
      setTimeout(() => {
        window.location.hash = '#/profile/orders';
      }, 1500);

    } catch (error) {
      alert("Error placing order: " + error.message);
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}