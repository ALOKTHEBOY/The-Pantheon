import { db } from '../../services/firebase.js';
import { collection, doc, deleteDoc, getDocs } from 'firebase/firestore';

export function DashboardProductList() {
  return `
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
      
      <!-- MOBILE FIX: Added flex-wrap and gap so the button can stack under the title on tiny screens -->
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="margin: 0;">Manage Catalog</h2>
        <a href="#/dashboard/products/add" class="btn" style="width: auto; padding: 10px 20px; text-decoration: none; display: inline-block;">+ Add New Product</a>
      </div>
      
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        
        <!-- MOBILE FIX: Added flex-wrap here too so the search and sort don't get squished -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: var(--spacing-md);">
          <input type="text" id="dashboard-search" placeholder="Search products..." style="flex: 1; min-width: 200px; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          <select id="dashboard-sort" style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div id="dashboard-product-list" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--color-text-muted);">Loading products...</p>
        </div>
      </div>
    </div>
  `;
}

export async function initDashboardProductList() {
  const listContainer = document.getElementById('dashboard-product-list');
  const sortSelect = document.getElementById('dashboard-sort');
  const searchInput = document.getElementById('dashboard-search');
  let allProducts = [];

  if (!listContainer) return;

  function renderList() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    let filtered = allProducts.filter(product => product.name.toLowerCase().includes(searchTerm));
    const sortBy = sortSelect.value;
    
    if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (filtered.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--color-text-muted);">No products found.</p>';
      return;
    }

    listContainer.innerHTML = filtered.map(product => `
      <!-- MOBILE FIX: Added flex-wrap and gap to the main row, allowing buttons to drop down if needed -->
      <div class="dashboard-product-row" data-id="${product.id}" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-background);">
        
        <!-- MOBILE FIX: Added flex: 1 and min-width: 0 so this side takes available space and allows text truncation -->
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px;">
          <img src="${product.image || (product.images && product.images[0])}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0;">
            <!-- MOBILE FIX: Truncate long titles with ... instead of breaking the layout -->
            <div style="font-weight: bold; color: var(--color-text-main); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.name}</div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 2px;">
              <span style="display: inline-block; padding: 2px 6px; background: var(--color-surface); border-radius: 10px; border: 1px solid var(--color-border); font-size: 0.75rem; margin-right: 5px;">${product.category}</span>
              <span style="color: #10b981; font-weight: bold;">₹${parseFloat(product.price).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <a href="#/dashboard/products/edit/${product.id}" style="background: var(--color-surface); color: var(--color-primary); border: 1px solid var(--color-border); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: bold; text-decoration: none;">Edit</a>
          <button class="delete-product-btn" data-id="${product.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async function loadProducts() {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList();
    } catch (error) {
       listContainer.innerHTML = '<p style="color: #ef4444;">Error loading products.</p>';
    }
  }

  await loadProducts();
  
  if (sortSelect) sortSelect.addEventListener('change', renderList);
  if (searchInput) searchInput.addEventListener('input', renderList);

  listContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-product-btn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          e.target.textContent = '...';
          await deleteDoc(doc(db, 'products', id));
          await loadProducts(); 
        } catch (error) { alert("Error deleting: " + error.message); }
      }
    }
  });
}