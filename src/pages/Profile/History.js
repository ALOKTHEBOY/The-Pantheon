import { db } from '../../services/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { authStore } from '../../store/authStore.js';

export function ProfileHistory() {
  return `
    <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem;">Order History</h2>
      
      <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div id="profile-orders-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <p style="color: var(--color-text-muted);">Loading your orders...</p>
        </div>
      </div>
    </div>
  `;
}

export async function initProfileHistory() {
  const ordersListContainer = document.getElementById('profile-orders-list');
  if (!ordersListContainer) return;

  const user = authStore.user;
  if (!user) {
    ordersListContainer.innerHTML = '<p style="color: #ef4444;">Please log in to view your orders.</p>';
    return;
  }

  try {
    const q = query(collection(db, "orders"), where("email", "==", user.email));
    const snapshot = await getDocs(q);
    let userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    userOrders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    if (userOrders.length === 0) {
      ordersListContainer.innerHTML = '<p style="color: var(--color-text-muted);">You have not placed any orders yet.</p>';
      return;
    }

    ordersListContainer.innerHTML = userOrders.map(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date Unknown';
      const status = order.status || 'pending';
      const statusColor = status === 'delivered' ? '#10b981' : (status === 'shipped' ? '#3b82f6' : '#f59e0b');

      return `
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1.5rem; background: var(--color-background);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1rem;">
            <div>
              <div style="font-weight: bold; color: var(--color-text-main);">Order #${order.id.slice(-6).toUpperCase()}</div>
              <div style="font-size: 0.9rem; color: var(--color-text-muted);">${orderDate}</div>
            </div>
            <div style="padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: ${statusColor}20; color: ${statusColor}; text-transform: capitalize;">
              ${status}
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">Items</div>
            <ul style="margin: 0; padding-left: 15px; font-size: 0.9rem; color: var(--color-text-main);">
              ${(order.items || []).map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
            </ul>
          </div>
          
          <div style="text-align: right; font-size: 1.2rem; font-weight: bold; color: var(--color-primary);">
            Total: ₹${parseFloat(order.totalAmount || 0).toFixed(2)}
          </div>
          
        </div>
      `;
    }).join('');

  } catch (error) {
    ordersListContainer.innerHTML = '<p style="color: #ef4444;">Error loading order history.</p>';
  }
}