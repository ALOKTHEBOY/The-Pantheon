import { db } from '../../services/firebase.js';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { showToast } from '../../utils/toast.js';
import { authStore } from '../../store/authStore.js';

export function DashboardProductForm() {
  return `
    <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <a href="#/dashboard/products" style="display: inline-block; margin-bottom: 1.5rem; color: var(--color-text-muted); text-decoration: none;">← Back to Catalog</a>
      
      <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 id="form-title" style="margin-bottom: var(--spacing-md);">Add New Product</h2>
        <form id="add-product-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- SECTION 1: BASIC INFORMATION -->
          <div style="padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">
            <h3 style="font-size: 1rem; margin-bottom: 10px; color: var(--color-text-muted); text-transform: uppercase;">1. Basic Info</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Product Name</label>
                <input type="text" id="prod-name" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
              </div>
              <div>
                <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Category</label>
                <select id="prod-category" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="home">Home</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 2: PRICING -->
          <div style="padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">
             <h3 style="font-size: 1rem; margin-bottom: 10px; color: var(--color-text-muted); text-transform: uppercase;">2. Pricing</h3>
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
          </div>

          <!-- SECTION 3: PRODUCT CONTENT -->
          <div style="padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">
            <h3 style="font-size: 1rem; margin-bottom: 10px; color: var(--color-text-muted); text-transform: uppercase;">3. Product Content</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Key Highlights (One per line)</label>
                <textarea id="prod-highlights" rows="3" placeholder="Wireless Bluetooth 5.0\n24-hour battery life\nWater-resistant" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); font-family: monospace; font-size: 0.85rem;"></textarea>
              </div>
              <div>
                <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Full Description / About</label>
                <textarea id="prod-about" required rows="4" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);"></textarea>
              </div>
            </div>
          </div>

          <!-- SECTION 4: PRODUCT MEDIA -->
          <div style="padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="font-size: 1rem; margin: 0; color: var(--color-text-muted); text-transform: uppercase;">4. Media & Video</h3>
              <button type="button" id="clear-media-btn" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.75rem; cursor: pointer;">Clear Media</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 10px; background: var(--color-background); border: 1px dashed var(--color-border); border-radius: 4px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.85rem; font-weight: bold;">Product Video (Optional)</label>
                <input type="url" id="prod-video-url" placeholder="https://youtube.com/embed/..." style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main); font-size: 0.85rem;">
                <small style="color: var(--color-text-muted); font-size: 0.75rem;">External URLs only (YouTube, Vimeo, MP4 link) to bypass 1MB database limits.</small>
              </div>

              <div>
                <label style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Image Gallery (Max 10)</label>
                <input type="file" id="prod-images" multiple accept="image/*" style="width: 100%; font-size: 0.85rem;">
                <div id="media-preview-container" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;"></div>
                <small id="media-edit-hint" style="color: var(--color-text-muted); display: none; margin-top: 5px; font-size: 0.8rem;">Leave blank to keep existing images.</small>
              </div>
            </div>
          </div>

          <button type="submit" id="submit-btn" class="btn" style="padding: 12px; font-size: 1rem;">Save Product</button>
        </form>
      </div>
    </div>
  `;
}

// NOTE: We now accept an optional 'productId' argument from the router
export async function initDashboardProductForm(productId = null) {
  const form = document.getElementById('add-product-form');
  const fileInput = document.getElementById('prod-images');
  const previewContainer = document.getElementById('media-preview-container');
  
  const origInput = document.getElementById('prod-original-price');
  const discSlider = document.getElementById('prod-discount-slider');
  const discValText = document.getElementById('disc-val');
  const finalInput = document.getElementById('prod-offer-price');
  const videoInput = document.getElementById('prod-video-url');
  const highlightsInput = document.getElementById('prod-highlights');

  if (!form) return;

  // --- PRE-FILL DATA IF EDITING ---
  if (productId) {
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';
    document.getElementById('media-edit-hint').style.display = 'block';
    
    try {
      const docSnap = await getDoc(doc(db, 'products', productId));
      if (docSnap.exists()) {
        const product = docSnap.data();
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-category').value = product.category || 'other';
        origInput.value = product.originalPrice || product.price;
        finalInput.value = product.price;
        document.getElementById('prod-about').value = product.about || '';
        highlightsInput.value = product.highlights ? product.highlights.join('\n') : '';
        videoInput.value = product.video || '';
        syncFromFinalPrice(); // Update the slider visually
      }
    } catch (error) {
      alert("Error loading product data.");
    }
  }

  // --- FILE MANAGER LOGIC ---
  fileInput.addEventListener('change', renderPreviews);

  function renderPreviews() {
    previewContainer.innerHTML = '';
    const files = fileInput.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumbWrapper = document.createElement('div');
        thumbWrapper.style.cssText = 'position: relative; width: 60px; height: 60px; border-radius: 4px; overflow: hidden; border: 1px solid var(--color-border);';
        thumbWrapper.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
          <button type="button" class="remove-thumb-btn" data-index="${index}" style="position: absolute; top: 2px; right: 2px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
        `;
        previewContainer.appendChild(thumbWrapper);
      };
      reader.readAsDataURL(file);
    });
  }

  previewContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-thumb-btn')) {
      const indexToRemove = parseInt(e.target.getAttribute('data-index'));
      const dt = new DataTransfer();
      const files = fileInput.files;
      for (let i = 0; i < files.length; i++) {
        if (i !== indexToRemove) dt.items.add(files[i]);
      }
      fileInput.files = dt.files;
      renderPreviews();
    }
  });

  document.getElementById('clear-media-btn').addEventListener('click', () => {
    fileInput.value = '';
    videoInput.value = '';
    previewContainer.innerHTML = '';
  });

  // --- PRICING LOGIC ---
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

  // --- FORM SUBMISSION LOGIC ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const files = fileInput.files;
    let base64Images = [];

    if (files.length > 0) {
      if (files.length > 10) return alert("Maximum 10 images allowed.");
      
      const imagePromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              let scale = 1;
              if (img.width > MAX_WIDTH) { scale = MAX_WIDTH / img.width; }
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
          };
          reader.onerror = error => reject(error);
        });
      });
      base64Images = await Promise.all(imagePromises);
    } else if (!productId) {
      return alert("Please upload at least one image for new products.");
    }

    const btn = document.getElementById('submit-btn');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Saving...';
      btn.disabled = true;

      const offerPrice = Number(finalInput.value);
      const originalPrice = Number(origInput.value);
      
      const highlightsArray = highlightsInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const payload = {
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        originalPrice: originalPrice,
        price: offerPrice, 
        discountPercentage: Math.round(((originalPrice - offerPrice) / originalPrice) * 100) || 0,
        about: document.getElementById('prod-about').value,
        highlights: highlightsArray,
        video: videoInput.value.trim() || null,
        updatedAt: new Date().toISOString(),
        updatedBy: authStore.user ? authStore.user.email : 'system'
      };

      if (base64Images.length > 0) {
        payload.images = base64Images;
        payload.image = base64Images[0]; // Set primary image
      }

      if (productId) {
        await updateDoc(doc(db, "products", productId), payload);
        showToast("Product updated successfully!");
      } else {
        payload.createdAt = new Date().toISOString();
        payload.createdBy = authStore.user ? authStore.user.email : 'system';
        await addDoc(collection(db, "products"), payload);
        showToast("Product added successfully!");
      }

      // Redirect back to the catalog list
      window.location.hash = '#/dashboard/products';
      
    } catch (error) {
      alert("Error saving product: " + error.message);
      btn.textContent = originalText;
      btn.disabled = false;
    } 
  });
}