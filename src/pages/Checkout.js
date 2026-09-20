import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';
import { db, functions } from '../services/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { settingsStore } from '../store/settingsStore.js';
import { STRIPE_PUBLISHABLE_KEY, isStripeConfigured } from '../config/stripe.js';

let stripe = null;
let cardElement = null;

export function Checkout() {
  const buyNowData = sessionStorage.getItem('buyNowItem');
  const items = buyNowData ? [JSON.parse(buyNowData)] : (cartStore.items || []);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Pull saved address from local storage
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
      .checkout-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: start; }
      .checkout-form { order: 1; }
      .checkout-summary { order: 2; }
      @media (max-width: 768px) {
        .checkout-grid { grid-template-columns: 1fr; }
        .checkout-summary { order: 1; margin-bottom: 1rem; }
        .checkout-form { order: 2; }
      }
    </style>
    
    <div class="checkout-grid" style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
      
      <!-- Shipping & Payment Form -->
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

          <!-- Stripe Payment Section -->
          <div style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h2 style="margin: 0; font-size: 1.15rem;">Payment Details</h2>
              <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 2px 8px; font-weight: 600;">🔒 Stripe Test Mode</span>
            </div>

            <div style="background: var(--color-background); border: 1px solid var(--color-border); border-radius: 6px; padding: 1rem;">
              <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span>Credit / Debit Card</span>
                <span>Test Card: <code>4242 4242 4242 4242</code></span>
              </div>
              <div id="card-element" style="padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-surface); min-height: 42px;">
                <!-- Stripe Card Element mounts here -->
              </div>
              <div id="card-errors" role="alert" style="color: #ef4444; font-size: 0.85rem; margin-top: 6px; min-height: 1.2rem;"></div>
            </div>
          </div>

          <button type="submit" id="submit-order-btn" class="btn" style="margin-top: 1rem; width: 100%; padding: 12px; font-size: 1rem; font-weight: 600;">
            Pay with Card & Place Order
          </button>
        </form>
      </div>

      <!-- Authoritative Order Summary -->
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
        <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.4;">
          🛡️ <em>Prices are cryptographically verified by Firebase Cloud Functions. Orders are fulfilled server-side via verified Stripe webhooks.</em>
        </p>
      </div>

    </div>
  `;
}

export function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const cardContainer = document.getElementById('card-element');
  const cardErrors = document.getElementById('card-errors');

  // Initialize Stripe Elements if configured, otherwise provide mock input
  if (typeof window !== 'undefined' && window.Stripe && isStripeConfigured()) {
    try {
      stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const elements = stripe.elements();
      cardElement = elements.create('card', {
        style: {
          base: {
            color: '#e2e8f0',
            fontFamily: 'inherit',
            fontSize: '15px',
            '::placeholder': { color: '#718096' }
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444'
          }
        }
      });
      cardElement.mount('#card-element');
      cardElement.on('change', (event) => {
        if (cardErrors) {
          cardErrors.textContent = event.error ? event.error.message : '';
        }
      });
    } catch (e) {
      console.warn("Could not mount Stripe Element:", e);
      renderMockCardInput(cardContainer);
    }
  } else {
    renderMockCardInput(cardContainer);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authStore.user) {
      alert("Please log in to place an order.");
      window.location.hash = '#/login';
      return;
    }

    const btn = document.getElementById('submit-order-btn') || form.querySelector('button');
    const originalText = btn.textContent;
    
    try {
      if (cardErrors) cardErrors.textContent = '';

      // Validate shipping address
      const shippingDetails = {
        fullName: document.getElementById('ship-name').value.trim(),
        phone: document.getElementById('ship-phone').value.trim(),
        address: document.getElementById('ship-address').value.trim(),
        city: document.getElementById('ship-city').value.trim(),
        zipCode: document.getElementById('ship-zip').value.trim()
      };

      if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.zipCode) {
        alert("Please complete all shipping address fields.");
        return;
      }

      // Check items
      const buyNowData = sessionStorage.getItem('buyNowItem');
      const items = buyNowData ? [JSON.parse(buyNowData)] : (cartStore.items || []);
      if (items.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      btn.textContent = '🔒 Securing checkout session...';
      btn.disabled = true;

      const payloadItems = items.map(item => ({
        productId: item.id || item.productId,
        quantity: item.quantity
      }));

      // STEP 1: Call trusted Cloud Function to verify prices and store checkout session
      const prepareCheckoutFn = httpsCallable(functions, 'prepareCheckout');
      const result = await prepareCheckoutFn({
        items: payloadItems,
        shippingDetails: shippingDetails
      });
      const session = result.data;

      if (!session || !session.success) {
        throw new Error("Server failed to authorize checkout session.");
      }

      btn.textContent = '💳 Authorizing payment...';

      // STEP 2: Process payment with Stripe Test Mode
      if (stripe && cardElement && !session.isMock) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(session.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingDetails.fullName,
              email: authStore.user.email
            }
          }
        });

        if (error) {
          throw new Error(error.message);
        }
      } else if (session.isMock) {
        // Local mock simulation
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFulfill = httpsCallable(functions, 'simulateMockFulfillment');
        await mockFulfill({ checkoutSessionId: session.checkoutSessionId });
      }

      // STEP 3: ASYNCHRONOUS SERVER FULFILLMENT OBSERVATION
      // Notice: The browser does NOT call addDoc() or create the order!
      // The browser waits for the trusted backend fulfillment.
      btn.textContent = '⏳ Payment received — confirming your order...';

      // Save shipping address for user convenience
      localStorage.setItem('pantheon_address', JSON.stringify(shippingDetails));

      const orderDocRef = doc(db, "orders", session.paymentIntentId);
      let isOrderConfirmed = false;

      const unsubscribe = onSnapshot(orderDocRef, (orderSnap) => {
        if (orderSnap.exists() && !isOrderConfirmed) {
          isOrderConfirmed = true;
          unsubscribe();
          clearTimeout(fallbackTimer);

          btn.textContent = '🎉 Order Confirmed!';

          // Clear cart only after server verification is confirmed
          if (buyNowData) {
            sessionStorage.removeItem('buyNowItem');
          } else {
            cartStore.clearCart();
          }

          setTimeout(() => {
            window.location.hash = '#/profile/orders';
          }, 1500);
        }
      }, (listenErr) => {
        console.warn("Order listener notice:", listenErr);
      });

      // Graceful timeout handler in case of network latency
      const fallbackTimer = setTimeout(() => {
        if (!isOrderConfirmed) {
          unsubscribe();
          if (buyNowData) {
            sessionStorage.removeItem('buyNowItem');
          } else {
            cartStore.clearCart();
          }
          btn.textContent = '📦 Order in Progress';
          alert("Payment received! Your order is being finalized by our servers and will appear in your order history shortly.");
          window.location.hash = '#/profile/orders';
        }
      }, 15000);

    } catch (error) {
      console.error("Checkout error:", error);
      if (cardErrors) {
        cardErrors.textContent = error.message;
      } else {
        alert("Checkout error: " + error.message);
      }
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function renderMockCardInput(container) {
  if (!container) return;
  container.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center;">
      <input type="text" value="4242 •••• •••• 4242" readonly style="flex: 2; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text-main); font-family: monospace; font-size: 0.9rem;">
      <input type="text" value="12/28" readonly style="width: 65px; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text-main); font-family: monospace; font-size: 0.9rem; text-align: center;">
      <input type="text" value="CVC" readonly style="width: 50px; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text-main); font-family: monospace; font-size: 0.9rem; text-align: center;">
    </div>
    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
      Simulated Test Card (Mock Mode active)
    </div>
  `;
}