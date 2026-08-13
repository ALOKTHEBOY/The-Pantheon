import { db } from '../../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export function DashboardOverview() {
  return `
    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem;">Dashboard Overview</h2>
      
      <!-- Responsive grid that stacks on mobile -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
        
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="color: var(--color-text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Total Vault Revenue</h3>
          <!-- clamp() shrinks font size on mobile to prevent overflow -->
          <div id="analytics-sales" style="font-size: clamp(1.8rem, 6vw, 2.8rem); font-weight: bold; color: var(--color-primary); word-break: break-word;">₹0.00</div>
        </div>
        
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="color: var(--color-text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Artifacts Dispatched</h3>
          <div id="analytics-orders" style="font-size: clamp(2rem, 6vw, 2.8rem); font-weight: bold; color: var(--color-text-main);">0</div>
        </div>
        
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="color: var(--color-text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Avg. Order Value</h3>
          <div id="analytics-aov" style="font-size: clamp(1.8rem, 6vw, 2.8rem); font-weight: bold; color: #10b981; word-break: break-word;">₹0.00</div>
        </div>

      </div>
    </div>
  `;
}

export async function initDashboardOverview() {
  const salesEl = document.getElementById('analytics-sales');
  const ordersEl = document.getElementById('analytics-orders');
  const aovEl = document.getElementById('analytics-aov');
  
  if (!salesEl || !ordersEl || !aovEl) return;

  try {
    const snapshot = await getDocs(collection(db, "orders"));
    let allOrders = snapshot.docs.map(doc => doc.data());
    
    let totalRev = 0;
    allOrders.forEach(order => {
      totalRev += parseFloat(order.totalAmount || 0);
    });
    
    salesEl.textContent = '₹' + totalRev.toFixed(2);
    ordersEl.textContent = allOrders.length;
    
    const aov = allOrders.length > 0 ? (totalRev / allOrders.length) : 0;
    aovEl.textContent = '₹' + aov.toFixed(2);
    
  } catch (error) {
    salesEl.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">Error</span>';
    ordersEl.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">Error</span>';
    if(aovEl) aovEl.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">Error</span>';
  }
}