import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';
import { db } from '../services/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export function Checkout() {
  const items = cartStore.items || [];
  
  // FIXED: Calculate the total directly from the items array
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return `
      <div style="max-width: 800px; margin: 4rem auto; text-align: center;">
        <h2>Your cart is empty</h2>
        <p style="color: var(--color-text-muted); margin: 1rem 0;">Add some products before proceeding to checkout.</p>
        <a href="#products" class="btn" style="text-decoration: none; display: inline-block;">Browse Products</a>
      </div>
    `;
  }

  return `
    <div style="max-width: 1000px; margin: 2rem auto; display: grid; gap: 2rem; grid-template-columns: 1fr 1fr; align-items: start; padding: 0 1rem;">
      
      <!-- Shipping Form -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Shipping Details</h2>
        <form id="checkout-form" style="display: flex; flex-direction: column; gap: 1rem;">
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Full Name</label>
            <input type="text" id="ship-name" required value="${authStore.user?.displayName || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Phone Number</label>
            <input type="tel" id="ship-phone" required placeholder="+91" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>

          <div>
            <label style="display: block; margin-bottom: 4px;">Delivery Address</label>
            <textarea id="ship-address" required rows="2" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);"></textarea>
          </div>

          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px;">City</label>
              <input type="text" id="ship-city" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px;">Zip Code</label>
              <input type="text" id="ship-zip" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
          </div>

          <button type="submit" class="btn" style="margin-top: 1rem;">Place Order</button>
        </form>
      </div>

      <!-- Order Summary -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
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
      window.location.hash = '#login';
      return;
    }

    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Processing...';
      btn.disabled = true;

      // FIXED: Calculate the final total right before saving to Firestore
      const items = cartStore.items || [];
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

      await addDoc(collection(db, "orders"), orderData);
      
      cartStore.clearCart();
      alert("Order placed successfully!");
      window.location.hash = '#profile'; 

    } catch (error) {
      alert("Error placing order: " + error.message);
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}