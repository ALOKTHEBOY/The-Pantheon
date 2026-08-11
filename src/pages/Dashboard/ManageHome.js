import { db } from '../../services/firebase.js';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { showToast } from '../../utils/toast.js';

export function ManageHome() {
  return `
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
          <h2 style="margin-bottom: 0.5rem; font-family: 'Georgia', serif;">Manage The Vault (Homepage)</h2>
          <p style="color: var(--color-text-muted); margin: 0;">Configure homepage layouts and custom banner advertisements.</p>
        </div>
        
        <select id="section-selector" style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main); font-weight: bold;">
          <option value="carousel">Section: Hero Banner (Carousel)</option>
          <option value="trending">Section: Trending in the Vault</option>
          <option value="tech">Section: Advanced Technology</option>
          <option value="newArrivals">Section: New Arrivals</option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        
        <!-- Left: Selected Items -->
        <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Currently Featured</h3>
          
          <ul id="selected-items-list" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; min-height: 200px;">
            <li style="color: var(--color-text-muted);">Loading configuration...</li>
          </ul>
          
          <button id="save-trending-btn" class="btn" style="width: 100%; margin-top: 1.5rem; background: #10b981; border-color: #10b981;">Save Configuration</button>
        </div>

        <!-- Right: Dynamic Tools (Search OR Form) -->
        <div id="right-panel" style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <!-- Dynamic Content Injected Here -->
        </div>

      </div>
    </div>
  `;
}

export async function initManageHome() {
  const selectedList = document.getElementById('selected-items-list');
  const rightPanel = document.getElementById('right-panel');
  const saveBtn = document.getElementById('save-trending-btn');
  const sectionSelector = document.getElementById('section-selector');

  if (!selectedList || !rightPanel) return;

  let allProducts = [];
  let layoutData = {
    trending: [],
    tech: [],
    newArrivals: [],
    carousel: [] 
  };
  let currentSection = 'carousel'; 
  let searchQuery = '';
  let editingSlideIndex = null;

  try {
    const productSnap = await getDocs(collection(db, 'products'));
    allProducts = productSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const settingsRef = doc(db, 'homepage_settings', 'layout');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      layoutData = { ...layoutData, ...settingsSnap.data() };
      if (!layoutData.carousel) layoutData.carousel = []; 
    }
    renderUI();
  } catch (error) {
    console.error("Error loading CMS:", error);
    showToast("Failed to load database connections.", "error");
  }

  if (sectionSelector) {
    sectionSelector.addEventListener('change', (e) => {
      currentSection = e.target.value;
      searchQuery = ''; 
      editingSlideIndex = null;
      renderUI();
    });
  }

  function renderUI() {
    renderLeftPanel();
    renderRightPanel();
  }

  function renderLeftPanel() {
    if (currentSection === 'carousel') {
      if (layoutData.carousel.length === 0) {
        selectedList.innerHTML = '<li style="color: var(--color-text-muted); padding: 10px;">No slides active.</li>';
      } else {
        selectedList.innerHTML = layoutData.carousel.map((slide, idx) => `
          <li style="display: flex; gap: 10px; align-items: center; padding: 10px; background: ${editingSlideIndex === idx ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-background)'}; border: 1px solid ${editingSlideIndex === idx ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: 4px; transition: all 0.2s;">
            <img src="${slide.image}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1; overflow: hidden;">
              <div style="font-weight: bold; font-size: 0.9rem; white-space: nowrap; text-overflow: ellipsis;">${slide.title}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">${slide.link.startsWith('#/products?category=') ? slide.link.replace('#/products?category=', 'Category: ') : 'Custom Link'}</div>
            </div>
            <button class="edit-slide-btn" data-index="${idx}" style="background: none; border: none; color: var(--color-primary); cursor: pointer; font-weight: bold; padding: 5px; font-size: 1.1rem;">✎</button>
            <button class="remove-slide-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold; padding: 5px; font-size: 1.1rem;">✕</button>
          </li>
        `).join('');
      }
    } else {
      const activeIds = layoutData[currentSection] || [];
      if (activeIds.length === 0) {
        selectedList.innerHTML = '<li style="color: var(--color-text-muted); padding: 10px;">No items selected.</li>';
      } else {
        selectedList.innerHTML = activeIds.map(id => {
          const p = allProducts.find(prod => prod.id === id);
          if (!p) return '';
          return `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 4px;">
              <div style="font-weight: bold; font-size: 0.9rem; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
              <button class="remove-product-btn" data-id="${p.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold;">✕</button>
            </li>
          `;
        }).join('');
      }
    }
  }

  function renderRightPanel() {
    if (currentSection === 'carousel') {
      const isEditing = editingSlideIndex !== null;
      const slide = isEditing ? layoutData.carousel[editingSlideIndex] : null;
      
      const isCustomLink = slide && !slide.link.startsWith('#/products?category=');
      let linkValue = 'all';
      if (slide) {
         if (slide.link === '#/products') linkValue = 'all';
         else if (slide.link.startsWith('#/products?category=')) linkValue = slide.link.split('=')[1];
         else linkValue = 'custom';
      }

      rightPanel.innerHTML = `
        <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">${isEditing ? 'Edit Slide' : 'Create New Slide'}</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <input type="text" id="slide-title" value="${slide ? slide.title : ''}" placeholder="Main Title (e.g. 50% OFF)" style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          <input type="text" id="slide-subtitle" value="${slide ? slide.subtitle : ''}" placeholder="Subtitle / Description" style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          
          <!-- IMAGE UPLOAD WITH CLEAR BUTTON -->
          <div style="padding: 10px; border-radius: 4px; border: 1px dashed var(--color-border); background: var(--color-background);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 0.85rem; font-weight: bold;">Banner Image</label>
              <button type="button" id="clear-image-btn" style="background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-main); font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Clear Image</button>
            </div>
            
            <input type="file" id="slide-image-file" accept="image/*" style="width: 100%; margin-bottom: 8px; font-size: 0.85rem;">
            <div style="text-align: center; font-size: 0.8rem; margin-bottom: 8px; color: var(--color-text-muted);">OR PASTE URL</div>
            <input type="url" id="slide-image-url" value="${slide && slide.image.startsWith('http') ? slide.image : ''}" placeholder="https://..." style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main);">
            ${slide && slide.image.startsWith('data:image') ? `<small id="uploaded-status-msg" style="color: #10b981; display: block; margin-top: 5px;">✓ File currently uploaded</small>` : ''}
          </div>

          <div style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background);">
            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: bold;">Link Destination</label>
            <select id="slide-category" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main);">
              <option value="all" ${linkValue === 'all' ? 'selected' : ''}>Link to: All Products</option>
              <option value="relics" ${linkValue === 'relics' ? 'selected' : ''}>Link to: Ancient Relics</option>
              <option value="hyperdrive" ${linkValue === 'hyperdrive' ? 'selected' : ''}>Link to: Hyperdrives</option>
              <option value="armor" ${linkValue === 'armor' ? 'selected' : ''}>Link to: Historical Armor</option>
              <option value="potions" ${linkValue === 'potions' ? 'selected' : ''}>Link to: Elixirs</option>
              <option value="chronos" ${linkValue === 'chronos' ? 'selected' : ''}>Link to: Chrono-Devices</option>
              <option value="droids" ${linkValue === 'droids' ? 'selected' : ''}>Link to: Droids</option>
              <option value="custom" ${linkValue === 'custom' ? 'selected' : ''} style="font-weight: bold;">Specific Product / Custom Link</option>
            </select>
            <input type="text" id="slide-custom-link" value="${isCustomLink ? slide.link : ''}" placeholder="Paste specific product link (e.g. #/product/123)" style="display: ${linkValue === 'custom' ? 'block' : 'none'}; width: 100%; margin-top: 8px; padding: 8px; border-radius: 4px; border: 1px solid var(--color-primary); background: var(--color-surface); color: var(--color-text-main);">
          </div>

          <input type="text" id="slide-btn-text" value="${slide ? slide.btnText : ''}" placeholder="Button Text (e.g. Shop Now)" style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          
          <button id="save-slide-btn" class="btn" style="margin-top: 10px;">${isEditing ? 'Update Slide' : '+ Add to Carousel'}</button>
          ${isEditing ? `<button id="cancel-edit-btn" style="background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); padding: 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">Cancel Edit</button>` : ''}
          <small style="color: var(--color-text-muted); text-align: center;">Max 10 slides recommended.</small>
        </div>
      `;
    } else {
      rightPanel.innerHTML = `
        <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Search Catalog</h3>
        <input type="text" id="trending-search" value="${searchQuery}" placeholder="Search artifacts..." style="width: 100%; padding: 10px; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text-main);">
        <ul id="available-products-list" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; scrollbar-width: thin;">
        </ul>
      `;
      const availableList = document.getElementById('available-products-list');
      const activeIds = layoutData[currentSection] || [];
      const availableProducts = allProducts.filter(p => !activeIds.includes(p.id) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (availableProducts.length === 0) {
        availableList.innerHTML = '<li style="color: var(--color-text-muted); padding: 10px;">No matching artifacts found.</li>';
      } else {
        availableList.innerHTML = availableProducts.map(p => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 4px;">
            <div style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${p.name}</div>
            <button class="add-product-btn" data-id="${p.id}" style="background: var(--color-primary); color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.8rem;">Add</button>
          </li>
        `).join('');
      }
    }
  }

  // IMAGE COMPRESSOR - Prevents 1MB Firestore Limit Crashes
  function getCompressedBase64Image(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; // Resize banner to max 1200px width
          let scale = 1;
          if (img.width > MAX_WIDTH) { scale = MAX_WIDTH / img.width; }
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% quality
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = event.target.result;
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('change', (e) => {
    if (e.target.id === 'slide-category') {
      const customLinkInput = document.getElementById('slide-custom-link');
      if (customLinkInput) {
        customLinkInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
      }
    }
  });

  document.addEventListener('click', async (e) => {
    
    // -- CLEAR IMAGE BUTTON LOGIC --
    if (e.target.matches('#clear-image-btn')) {
      const fileInput = document.getElementById('slide-image-file');
      const urlInput = document.getElementById('slide-image-url');
      const statusMsg = document.getElementById('uploaded-status-msg');
      if (fileInput) fileInput.value = '';
      if (urlInput) urlInput.value = '';
      if (statusMsg) statusMsg.style.display = 'none';
      showToast("Image cleared.");
    }
    
    // -- CAROUSEL CONTROLS --
    if (e.target.matches('.remove-slide-btn')) {
      const idx = parseInt(e.target.getAttribute('data-index'));
      layoutData.carousel.splice(idx, 1);
      if (editingSlideIndex === idx) editingSlideIndex = null;
      renderUI();
    }
    
    if (e.target.matches('.edit-slide-btn')) {
      editingSlideIndex = parseInt(e.target.getAttribute('data-index'));
      renderUI();
    }

    if (e.target.matches('#cancel-edit-btn')) {
      editingSlideIndex = null;
      renderUI();
    }
    
    if (e.target.matches('#save-slide-btn')) {
      const btn = e.target;
      const origBtnText = btn.textContent;
      
      if (layoutData.carousel.length >= 10 && editingSlideIndex === null) return showToast("Maximum 10 slides allowed.", "error");
      
      const title = document.getElementById('slide-title').value.trim();
      const subtitle = document.getElementById('slide-subtitle').value.trim();
      const category = document.getElementById('slide-category').value;
      const customLink = document.getElementById('slide-custom-link').value.trim();
      const btnText = document.getElementById('slide-btn-text').value.trim() || 'Shop Now';
      
      const fileInput = document.getElementById('slide-image-file');
      const urlInput = document.getElementById('slide-image-url');
      let finalImage = urlInput.value.trim();

      try {
        btn.textContent = 'Processing Image...';
        btn.disabled = true;

        if (fileInput.files.length > 0) {
          finalImage = await getCompressedBase64Image(fileInput.files[0]);
        } else if (!finalImage && editingSlideIndex !== null) {
          finalImage = layoutData.carousel[editingSlideIndex].image;
        }

        if (!title || !finalImage) {
          btn.textContent = origBtnText;
          btn.disabled = false;
          return showToast("Title and an Image are required.", "error");
        }

        let link = '#/products';
        if (category === 'custom') {
          if (!customLink) {
             btn.textContent = origBtnText;
             btn.disabled = false;
             return showToast("Please provide a custom link.", "error");
          }
          link = customLink;
        } else if (category !== 'all') {
          link = `#/products?category=${category}`;
        }

        const newSlide = { title, subtitle, image: finalImage, link, btnText };

        if (editingSlideIndex !== null) {
          layoutData.carousel[editingSlideIndex] = newSlide;
          editingSlideIndex = null; 
        } else {
          layoutData.carousel.push(newSlide);
        }
        
        renderUI();
      } catch (err) {
        showToast("Failed to process uploaded image.", "error");
        btn.textContent = origBtnText;
        btn.disabled = false;
      }
    }

    // -- PRODUCT GRID CONTROLS --
    if (e.target.matches('.add-product-btn')) {
      if ((layoutData[currentSection] || []).length >= 8) return showToast("Maximum 8 items per section.", "error");
      layoutData[currentSection].push(e.target.getAttribute('data-id'));
      renderUI();
    }
    
    if (e.target.matches('.remove-product-btn')) {
      layoutData[currentSection] = layoutData[currentSection].filter(id => id !== e.target.getAttribute('data-id'));
      renderUI();
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'trending-search') {
      searchQuery = e.target.value;
      renderRightPanel();
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      try {
        const settingsRef = doc(db, 'homepage_settings', 'layout');
        await setDoc(settingsRef, layoutData, { merge: true });
        showToast("Vault configuration saved successfully!");
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save changes. Your images might still be too large.");
      } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
    });
  }
}