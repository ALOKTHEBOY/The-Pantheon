import { db } from '../../services/firebase.js';
import { collection, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { showToast } from '../../utils/toast.js';

export function DashboardOrders() {
  return `
    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        
        <!-- NEW: Search and Filter Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <h2 style="margin: 0;">Store Orders</h2>
          
          <div style="display: flex; gap: 10px; flex: 1; max-width: 500px; justify-content: flex-end;">
            <input type="text" id="order-search" placeholder="Search ID, Name, or Email..." style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            <select id="order-status-filter" style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div id="dashboard-orders-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <p style="color: var(--color-text-muted);">Loading orders...</p>
        </div>
      </div>
    </div>
  `;
}

export async function initDashboardOrders() {
  const ordersListContainer = document.getElementById('dashboard-orders-list');
  const searchInput = document.getElementById('order-search');
  const statusFilter = document.getElementById('order-status-filter');
  
  let allOrders = []; // Store fetched orders globally for this module

  if (!ordersListContainer) return;

  // NEW: Dedicated render function for filtering
  function renderOrders() {
    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase();
    const statusTerm = statusFilter ? statusFilter.value : 'all';

    // 1. Filter the array in memory
    let filtered = allOrders.filter(order => {
      const name = (order.shippingDetails?.fullName || order.customerName || '').toLowerCase();
      const email = (order.email || order.customerEmail || '').toLowerCase();
      const orderId = (order.id || '').toLowerCase();
      const status = (order.status || 'pending').toLowerCase();

      const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm) || orderId.includes(searchTerm);
      const matchesStatus = statusTerm === 'all' || status === statusTerm;

      return matchesSearch && matchesStatus;
    });

    // 2. Handle empty results
    if (filtered.length === 0) {
      ordersListContainer.innerHTML = '<p style="color: var(--color-text-muted);">No orders match your search criteria.</p>';
      return;
    }

    // 3. Render the filtered list
    ordersListContainer.innerHTML = filtered.map(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date Unknown';
      const name = order.shippingDetails?.fullName || order.customerName || 'Unknown Customer';
      const email = order.email || order.customerEmail || 'No Email Provided';
      const phone = order.shippingDetails?.phone || 'No Phone';
      const address = order.shippingDetails?.address || 'No Address Provided';
      const city = order.shippingDetails?.city || '';
      const zip = order.shippingDetails?.zipCode || '';
      const fullAddress = [address, city, zip].filter(Boolean).join(', ');
      const currentStatus = order.status || 'pending';

      return `
      <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1.5rem; background: var(--color-background); display: flex; flex-direction: column; gap: 1rem;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
          <div>
            <span style="font-weight: bold; color: var(--color-text-main);">Order ID: ${order.id}</span>
            <span style="color: var(--color-text-muted); font-size: 0.9rem; margin-left: 10px;">${orderDate}</span>
          </div>
          <button class="delete-order-btn" data-id="${order.id}" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 0.85rem; cursor: pointer; flex-shrink: 0; margin-left: 1rem;">Delete</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          
          <div>
            <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">Customer Details</div>
            <div style="font-weight: bold; color: var(--color-text-main);">${name}</div>
            <div style="font-size: 0.9rem; color: var(--color-text-muted);">${email}</div>
            <div style="font-size: 0.9rem; color: var(--color-text-muted);">${phone}</div>
          </div>

          <div>
            <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">Shipping Address</div>
            <div style="font-size: 0.9rem; color: var(--color-text-main); line-height: 1.4;">${fullAddress}</div>
          </div>

          <div>
            <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">Items Ordered</div>
            <ul style="margin: 0; padding-left: 15px; font-size: 0.9rem; color: var(--color-text-main);">
              ${(order.items || []).map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
            </ul>
          </div>

          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
            <div>
              <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">Total Amount</div>
              <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">₹${parseFloat(order.totalAmount || 0).toFixed(2)}</div>
            </div>
            
            <div style="width: 100%;">
              <div style="font-size: 0.75rem; font-weight: bold; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Update Status</div>
              <select class="status-select" data-id="${order.id}" style="padding: 6px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); width: 100%; font-weight: bold; cursor: pointer;">
                <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="shipped" ${currentStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            </div>
          </div>
          
        </div>
      </div>
      `}).join('');
  }

  async function loadOrders() {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort newest to oldest
      allOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      renderOrders(); // Render initially
    } catch (error) {
      ordersListContainer.innerHTML = '<p style="color: #ef4444;">Error loading orders.</p>';
    }
  }

  // Load the data from Firestore on mount
  await loadOrders();

  // NEW: Listeners for real-time filtering
  if (searchInput) searchInput.addEventListener('input', renderOrders);
  if (statusFilter) statusFilter.addEventListener('change', renderOrders);

  // Status update listener (with UX loading state)
  ordersListContainer.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select')) {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      try {
        e.target.style.opacity = '0.5';
        e.target.style.pointerEvents = 'none';
        
        await updateDoc(doc(db, 'orders', id), { status: newStatus });
        
        // Update local array so it stays filtered correctly if re-rendered
        const updatedOrder = allOrders.find(o => o.id === id);
        if (updatedOrder) updatedOrder.status = newStatus;
        
        showToast(`Order status updated to ${newStatus.toUpperCase()}`);
      } catch (error) {
        alert("Error updating status: " + error.message);
      } finally {
        e.target.style.opacity = '1';
        e.target.style.pointerEvents = 'auto';
        renderOrders(); // Re-render to apply any active filters
      }
    }
  });

  // Delete listener
  ordersListContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-order-btn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this order?')) {
        try {
          e.target.textContent = '...';
          e.target.disabled = true;
          await deleteDoc(doc(db, 'orders', id));
          await loadOrders(); 
        } catch (error) { 
          alert("Error deleting order: " + error.message);
          e.target.textContent = 'Delete';
          e.target.disabled = false;
        }
      }
    }
  });
}