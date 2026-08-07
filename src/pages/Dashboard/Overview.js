import { db } from '../../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export function DashboardOverview() {
  return `
    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem;">Dashboard Overview</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="color: var(--color-text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Total Revenue</h3>
          <div id="analytics-sales" style="font-size: 3rem; font-weight: bold; color: var(--color-primary);">₹0.00</div>
        </div>
        
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="color: var(--color-text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Total Orders</h3>
          <div id="analytics-orders" style="font-size: 3rem; font-weight: bold; color: var(--color-text-main);">0</div>
        </div>
      </div>
    </div>
  `;
}

export async function initDashboardOverview() {
  const salesEl = document.getElementById('analytics-sales');
  const ordersEl = document.getElementById('analytics-orders');
  
  if (!salesEl || !ordersEl) return;

  try {
    const snapshot = await getDocs(collection(db, "orders"));
    let allOrders = snapshot.docs.map(doc => doc.data());
    
    let totalRev = 0;
    allOrders.forEach(order => {
      totalRev += parseFloat(order.totalAmount || 0);
    });
    
    salesEl.textContent = '₹' + totalRev.toFixed(2);
    ordersEl.textContent = allOrders.length;
  } catch (error) {
    salesEl.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">Error</span>';
    ordersEl.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">Error</span>';
  }
}