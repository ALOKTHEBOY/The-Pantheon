import { db } from '../services/firebase.js';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

export function Dashboard() {
  return `
    <div style="max-width: 1000px; margin: 2rem auto; display: grid; gap: 2rem; grid-template-columns: 1fr 1fr; align-items: start;">
      
      <!-- Left Column -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 id="form-title" style="margin-bottom: var(--spacing-md);">Add New Product</h2>
        <form id="add-product-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Product Name</label>
            <input type="text" id="prod-name" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 4px;">Category</label>
            <select id="prod-category" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
              <option value="electronics">Electronics</option>
              <option value="apparel">Apparel</option>
              <option value="home">Home</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="toys">Toys & Games</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style="display: flex; gap: 1rem; align-items: flex-end;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Original (₹)</label>
              <input type="number" step="0.01" min="0" id="prod-original-price" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Discount (<span id="disc-val">0</span>%)</label>
              <input type="range" id="prod-discount-slider" min="0" max="100" value="0" style="width: 100%;">
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Final Offer (₹)</label>
              <input type="number" step="0.01" min="0" id="prod-offer-price" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 4px;">About / Description</label>
            <textarea id="prod-about" required rows="3" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);"></textarea>
          </div>

          <div style="padding: 10px; border: 1px dashed var(--color-border); border-radius: 4px;">
            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Media</label>
            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Option 1: Paste Image URL</label>
            <input type="url" id="prod-image-url" placeholder="https://example.com/image.jpg" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); margin-bottom: 10px; background: var(--color-background); color: var(--color-text-main);">
            
            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Option 2: Upload Files (Max 5)</label>
            <input type="file" id="prod-images" multiple accept="image/*,video/*" style="width: 100%;">
            <small id="media-edit-hint" style="color: var(--color-text-muted); display: none;">Leave media fields blank to keep existing images.</small>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button type="submit" id="submit-btn" class="btn" style="flex: 1;">Add Product</button>
            <button type="button" id="cancel-edit-btn" class="btn" style="background: var(--color-text-muted); display: none;">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Right Column -->
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
          <h2 style="margin: 0;">Manage Products</h2>
          <select id="dashboard-sort" style="padding: 6px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
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
  const sortSelect = document.getElementById('dashboard-sort');
  
  const origInput = document.getElementById('prod-original-price');
  const discSlider = document.getElementById('prod-discount-slider');
  const discValText = document.getElementById('disc-val');
  const finalInput = document.getElementById('prod-offer-price');
  
  let editingProductId = null;
  let allProducts = [];

  if (!form || !listContainer) return;

  function syncFromOriginalOrSlider() {
    const orig = parseFloat(origInput.value) || 0;
    const disc = parseFloat(discSlider.value) || 0;
    discValText.textContent = disc;
    const final = orig - (orig * (disc / 100));
    finalInput.value = final.toFixed(2);
  }

  function syncFromFinalPrice() {
    const orig = parseFloat(origInput.value) || 0;
    let final = parseFloat(finalInput.value) || 0;
    if (final > orig) { final = orig; finalInput.value = final.toFixed(2); }
    if (orig > 0) {
      const disc = Math.round(((orig - final) / orig) * 100);
      discSlider.value = disc;
      discValText.textContent = disc;
    }
  }

  origInput.addEventListener('input', syncFromOriginalOrSlider);
  discSlider.addEventListener('input', syncFromOriginalOrSlider);
  finalInput.addEventListener('input', syncFromFinalPrice);

  function renderList() {
    let sorted = [...allProducts];
    const sortBy = sortSelect.value;
    
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
    else sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (sorted.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--color-text-muted);">No products found.</p>';
      return;
    }

    listContainer.innerHTML = sorted.map(product => `
      <div class="dashboard-product-row" data-id="${product.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        <div style="display: flex; align-items: center; gap: 10px; pointer-events: none;">
          <img src="${product.image || (product.images && product.images[0])}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
          <div>
            <div style="font-weight: bold; color: var(--color-text-main);">${product.name}</div>
            <div style="font-size: 0.9rem;">
              <strike style="color: var(--color-text-muted);">₹${parseFloat(product.originalPrice || product.price).toFixed(2)}</strike> 
              <span style="color: #10b981; font-weight: bold; margin-left: 5px;">₹${parseFloat(product.price).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="edit-product-btn" data-id="${product.id}" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Edit</button>
          <button class="delete-product-btn" data-id="${product.id}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Delete</button>
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
  sortSelect.addEventListener('change', renderList);

  function resetForm() {
    form.reset();
    editingProductId = null;
    discValText.textContent = '0';
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').textContent = 'Add Product';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('media-edit-hint').style.display = 'none';
  }

  document.getElementById('cancel-edit-btn').addEventListener('click', resetForm);

  listContainer.addEventListener('click', async (e) => {
    const id = e.target.closest('.dashboard-product-row')?.getAttribute('data-id');

    if (e.target.classList.contains('delete-product-btn')) {
      e.stopPropagation(); 
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          e.target.textContent = '...';
          await deleteDoc(doc(db, 'products', id));
          await loadProducts(); 
        } catch (error) { alert("Error deleting: " + error.message); }
      }
    } else if (e.target.classList.contains('edit-product-btn')) {
      e.stopPropagation(); 
      const product = allProducts.find(p => p.id === id);
      if (product) {
        editingProductId = product.id;
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-category').value = product.category || 'other';
        origInput.value = product.originalPrice || product.price;
        finalInput.value = product.price;
        document.getElementById('prod-about').value = product.about || '';
        
        syncFromFinalPrice(); // Automatically update the slider
        
        document.getElementById('form-title').textContent = 'Edit Product';
        document.getElementById('submit-btn').textContent = 'Update Product';
        document.getElementById('cancel-edit-btn').style.display = 'block';
        document.getElementById('media-edit-hint').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
      }
    } else if (id) {
      window.location.hash = `#product/${id}`;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('prod-image-url').value.trim();
    const files = document.getElementById('prod-images').files;
    let base64Images = [];

    if (urlInput !== '') {
      base64Images = [urlInput];
    } else if (files.length > 0) {
      if (files.length > 5) return alert("Maximum 5 files allowed.");
      const imagePromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      });
      base64Images = await Promise.all(imagePromises);
    } else if (!editingProductId) {
      return alert("Please provide an Image URL or upload a file.");
    }

    const btn = document.getElementById('submit-btn');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Saving...';
      btn.disabled = true;

      const offerPrice = Number(finalInput.value);
      const originalPrice = Number(origInput.value);

      const payload = {
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        originalPrice: originalPrice,
        price: offerPrice, 
        discountPercentage: Math.round(((originalPrice - offerPrice) / originalPrice) * 100) || 0,
        about: document.getElementById('prod-about').value
      };

      if (base64Images.length > 0) {
        payload.images = base64Images;
        payload.image = base64Images[0];
      }

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), payload);
        alert("Product updated successfully!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "products"), payload);
        alert("Product added successfully!");
      }

      resetForm();
      await loadProducts(); 
      
    } catch (error) {
      alert("Error saving product: " + error.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}