import { db } from '../../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export function DashboardAnalytics() {
  return `
    <style>
      /* Desktop Layout */
      .analytics-header { display: flex; }
      .analytics-row { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center; }
      .analytics-stats { display: flex; gap: 2rem; align-items: center; width: 250px; justify-content: flex-end; }
      .expandable-row { cursor: pointer; }
      .expandable-row:hover { border-color: var(--color-primary) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

      /* Mobile Layout Fix (The "Out of the box" fix) */
      @media (max-width: 650px) {
        .analytics-header { display: none !important; /* Hide crushed header on phones */ }
        .analytics-row { flex-direction: column; align-items: flex-start !important; }
        .analytics-stats { width: 100% !important; justify-content: flex-start !important; margin-top: 15px; border-top: 1px solid var(--color-border); padding-top: 15px; }
      }
    </style>

    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem; font-family: 'Georgia', serif;">Artifact Movement Ledger</h2>
      
      <div style="padding: 1.5rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <h3 style="margin: 0; color: var(--color-text-main); font-size: 1.1rem;">Sales Breakdown & Buyer Logs (Tap to expand)</h3>
          <input type="text" id="analytics-search" placeholder="Search artifact name..." style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); min-width: 250px; flex: 1; max-width: 400px;">
        </div>

        <!-- Header Row (Auto-hides on mobile) -->
        <div class="analytics-header" style="justify-content: space-between; padding: 0 1rem 0.5rem 1rem; border-bottom: 1px solid var(--color-border); margin-bottom: 1rem; color: var(--color-text-muted); font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          <div style="flex: 1;">Artifact & Quick Summary</div>
          <div style="display: flex; gap: 2rem; width: 250px; justify-content: flex-end;">
            <div style="width: 80px; text-align: right;">Units Sold</div>
            <div style="width: 120px; text-align: right;">Total Revenue</div>
          </div>
        </div>

        <div id="analytics-product-list" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--color-text-muted);">Compiling temporal sales data...</p>
        </div>

      </div>
    </div>
  `;
}

export async function initDashboardAnalytics() {
  const container = document.getElementById('analytics-product-list');
  const searchInput = document.getElementById('analytics-search');
  
  let aggregatedStats = [];

  if (!container) return;

  function renderAnalytics() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filteredStats = aggregatedStats.filter(stat => 
      stat.name.toLowerCase().includes(searchTerm)
    );

    if (filteredStats.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted);">No sales records found for this query.</p>';
      return;
    }

    container.innerHTML = filteredStats.map(stat => {
      const buyersArray = Array.from(stat.buyers);
      const displayBuyers = buyersArray.slice(0, 3).join(', ');
      const extraBuyers = buyersArray.length > 3 ? ` <span style="color: var(--color-primary); font-size: 0.8rem; font-weight: bold;">+${buyersArray.length - 3} more</span>` : '';

      // GENERATE THE HIDDEN ACQUISITION LOG (The Dropdown Content)
      const detailsHTML = stat.purchases.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--color-border); font-size: 0.9rem; flex-wrap: wrap; gap: 10px;">
          <div style="color: var(--color-text-main);">
            <strong>${p.buyer}</strong> 
            <span style="color: var(--color-text-muted); font-size: 0.8rem; margin-left: 8px; display: inline-block;">🗓️ ${p.date}</span>
          </div>
          <div style="color: var(--color-text-muted);">
            <span style="display: inline-block; background: var(--color-surface); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--color-border); font-size: 0.8rem; margin-right: 10px;">Qty: ${p.qty}</span>
            <span style="color: #10b981; font-weight: bold;">₹${p.total}</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="expandable-row" data-target="details-${stat.id}" style="padding: 1rem; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 6px; transition: all 0.2s;">
          
          <!-- The Visible Summary Card -->
          <div class="analytics-row">
            <div style="flex: 1; min-width: 0;"> <!-- min-width: 0 allows word wrapping -->
              <div style="font-weight: bold; color: var(--color-text-main); font-size: 1.05rem; margin-bottom: 4px; word-break: break-word;">${stat.name}</div>
              <div style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.4;">
                <span style="font-weight: bold; color: var(--color-text-main);">Acquired by:</span> ${displayBuyers}${extraBuyers}
              </div>
            </div>

            <div class="analytics-stats">
              <div style="text-align: right; width: 80px;">
                <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 2px; display: block;">Units</div>
                <div style="font-weight: bold; font-size: 1.2rem; color: var(--color-text-main);">${stat.quantity}</div>
              </div>
              
              <div style="text-align: right; width: 120px;">
                <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 2px; display: block;">Generated</div>
                <div style="font-weight: bold; font-size: 1.2rem; color: #10b981;">₹${stat.revenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          <!-- The Hidden Detailed Log (Toggles on click) -->
          <div id="details-${stat.id}" style="display: none; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); animation: fadeIn 0.3s ease-out;">
            <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 8px;">Detailed Acquisition Log</div>
            ${detailsHTML}
          </div>
          
        </div>
      `;
    }).join('');
  }

  try {
    const snapshot = await getDocs(collection(db, "orders"));
    const orders = snapshot.docs.map(doc => doc.data());

    const statsMap = {};

    orders.forEach(order => {
      const buyerName = order.shippingDetails?.fullName || order.customerName || order.email || 'Anonymous Collector';
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date Unknown';
      
      const orderItems = order.items || [];

      orderItems.forEach(item => {
        if (!statsMap[item.id]) {
          statsMap[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            buyers: new Set(),
            purchases: [] // NEW: Stores detailed logs for the dropdown
          };
        }
        
        statsMap[item.id].quantity += item.quantity;
        statsMap[item.id].revenue += (item.price * item.quantity);
        statsMap[item.id].buyers.add(buyerName);
        
        // NEW: Push the specific transaction details to the array
        statsMap[item.id].purchases.push({
          buyer: buyerName,
          date: orderDate,
          qty: item.quantity,
          total: (item.price * item.quantity).toFixed(2)
        });
      });
    });

    aggregatedStats = Object.values(statsMap).sort((a, b) => b.quantity - a.quantity);
    renderAnalytics();

  } catch (error) {
    console.error("Analytics Error:", error);
    container.innerHTML = '<p style="color: #ef4444;">Failed to compile the temporal ledger. Please check your database connection.</p>';
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderAnalytics);
  }

  // ACCORDION CLICK LISTENER
  container.addEventListener('click', (e) => {
    // Find the closest row that was clicked
    const row = e.target.closest('.expandable-row');
    if (!row) return;

    // Get the ID of the hidden details div for this specific row
    const targetId = row.getAttribute('data-target');
    const detailsDiv = document.getElementById(targetId);
    
    if (detailsDiv) {
      // Toggle the display between block (visible) and none (hidden)
      if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        row.style.borderColor = 'var(--color-primary)';
      } else {
        detailsDiv.style.display = 'none';
        row.style.borderColor = 'var(--color-border)';
      }
    }
  });
}