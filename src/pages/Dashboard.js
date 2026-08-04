import { db } from '../services/firebase.js';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore'; // Added doc & deleteDoc
import { fetchProducts } from '../services/api.js'; // Import our API function

export function Dashboard() {
  return `
    <div style="max-width: 900px; margin: 2rem auto; display: grid; gap: 2rem; grid-template-columns: 1fr 1fr; align-items: start;">
      
      <!-- Left Column: Add Product Form -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Add Product</h2>
        <form id="add-product-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
          <div>
            <label style="display: block; margin-bottom: 4px;">Product Name</label>
            <input type="text" id="prod-name" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px;">Price (₹)</label>
            <input type="number" id="prod-price" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px;">Image URL</label>
            <input type="url" id="prod-image" required placeholder="https://..." style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          <button type="submit" class="btn" style="margin-top: 10px;">Add Product</button>
        </form>
      </div>

      <!-- Right Column: Product List -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: var(--spacing-md);">Manage Products</h2>
        <div id="dashboard-product-list" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--color-text-muted);">Loading products...</p>
        </div>
      </div>

    </div>
  `;
}

export async function initDashboard() {
  const form = document.getElementById('add-product-form');
  const listContainer = document.getElementById('dashboard-product-list');
  if (!form || !listContainer) return;

  // 1. Function to Fetch and Render Products
  async function loadProducts() {
    const products = await fetchProducts();
    
    if (products.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--color-text-muted);">No products found.</p>';
      return;
    }

    listContainer.innerHTML = products.map(product => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
          <div>
            <div style="font-weight: bold; color: var(--color-text-main);">${product.name}</div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">₹${product.price}</div>
          </div>
        </div>
        <button class="delete-product-btn" data-id="${product.id}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Delete</button>
      </div>
    `).join('');
  }

  // Initial Load
  await loadProducts();

  // 2. Handle Form Submission (Add Product)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Adding...';
      btn.disabled = true;

      const newProduct = {
        name: document.getElementById('prod-name').value,
        price: Number(document.getElementById('prod-price').value),
        image: document.getElementById('prod-image').value,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "products"), newProduct);
      form.reset(); 
      await loadProducts(); // Instantly refresh the list
      
    } catch (error) {
      alert("Error adding product: " + error.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // 3. Handle Delete Button Clicks
  listContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-product-btn')) {
      const id = e.target.getAttribute('data-id');
      const btn = e.target;
      
      // Built-in browser confirmation popup
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          btn.textContent = '...';
          btn.disabled = true;
          
          // Delete from Firestore
          await deleteDoc(doc(db, 'products', id));
          
          // Refresh UI
          await loadProducts(); 
        } catch (error) {
          alert("Error deleting product: " + error.message);
          btn.textContent = 'Delete';
          btn.disabled = false;
        }
      }
    }
  });
}