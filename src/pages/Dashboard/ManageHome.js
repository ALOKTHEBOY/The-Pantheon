import { db } from '../../services/firebase.js';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { showToast } from '../../utils/toast.js';

export function ManageHome() {
  return `
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
          <h2 style="margin-bottom: 0.5rem; font-family: 'Georgia', serif;">Manage The Vault (Homepage)</h2>
          <p style="color: var(--color-text-muted); margin: 0;">Select items for your homepage sections. Maximum 8 items per section for optimal layout.</p>
        </div>
        
        <select id="section-selector" style="padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main); font-weight: bold;">
          <option value="trending">Section: Trending in the Vault</option>
          <option value="tech">Section: Advanced Technology</option>
          <option value="newArrivals">Section: New Arrivals</option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        
        <!-- Left: Selected Items -->
        <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Currently Featured</h3>
          
          <ul id="selected-trending-list" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; min-height: 200px;">
            <li style="color: var(--color-text-muted);">Loading configuration...</li>
          </ul>
          
          <button id="save-trending-btn" class="btn" style="width: 100%; margin-top: 1.5rem; background: #10b981; border-color: #10b981;">Save Configuration</button>
        </div>

        <!-- Right: Search Catalog -->
        <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Search Catalog</h3>
          <input type="text" id="trending-search" placeholder="Search artifacts..." style="width: 100%; padding: 10px; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text-main);">
          
          <ul id="available-products-list" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; scrollbar-width: thin;">
            <li style="color: var(--color-text-muted);">Loading database...</li>
          </ul>
        </div>

      </div>
    </div>
  `;
}

export async function initManageHome() {
  const selectedList = document.getElementById('selected-trending-list');
  const availableList = document.getElementById('available-products-list');
  const searchInput = document.getElementById('trending-search');
  const saveBtn = document.getElementById('save-trending-btn');
  const sectionSelector = document.getElementById('section-selector');

  if (!selectedList || !availableList) return;

  let allProducts = [];
  let layoutData = {
    trending: [],
    tech: [],
    newArrivals: []
  };
  let currentSection = 'trending';

  try {
    // 1. Fetch all products
    const productSnap = await getDocs(collection(db, 'products'));
    allProducts = productSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Fetch current homepage settings
    const settingsRef = doc(db, 'homepage_settings', 'layout');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      layoutData = { ...layoutData, ...settingsSnap.data() };
    }

    renderLists();

  } catch (error) {
    console.error("Error loading CMS:", error);
    showToast("Failed to load database connections.", "error");
  }

  // Handle Dropdown Change
  if (sectionSelector) {
    sectionSelector.addEventListener('change', (e) => {
      currentSection = e.target.value;
      renderLists(searchInput.value);
    });
  }

  // Render both lists based on state
  function renderLists(searchQuery = '') {
    const activeIds = layoutData[currentSection] || [];

    // Render Selected
    if (activeIds.length === 0) {
      selectedList.innerHTML = '<li style="color: var(--color-text-muted); padding: 10px; background: var(--color-background); border-radius: 4px;">No items selected for this section.</li>';
    } else {
      selectedList.innerHTML = activeIds.map(id => {
        const p = allProducts.find(prod => prod.id === id);
        if (!p) return '';
        return `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 4px;">
            <div style="font-weight: bold; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${p.name}</div>
            <button class="remove-btn" data-id="${p.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold;">✕</button>
          </li>
        `;
      }).join('');
    }

    // Render Available (Filtered)
    const availableProducts = allProducts.filter(p => !activeIds.includes(p.id) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (availableProducts.length === 0) {
      availableList.innerHTML = '<li style="color: var(--color-text-muted); padding: 10px;">No matching artifacts found.</li>';
    } else {
      availableList.innerHTML = availableProducts.map(p => `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 4px;">
          <div style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${p.name}</div>
          <button class="add-btn" data-id="${p.id}" style="background: var(--color-primary); color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.8rem;">Add</button>
        </li>
      `).join('');
    }
  }

  // Event Delegation for Add/Remove
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-btn')) {
      if ((layoutData[currentSection] || []).length >= 8) {
        showToast("Maximum of 8 items allowed per section.", "error");
        return;
      }
      layoutData[currentSection].push(e.target.getAttribute('data-id'));
      renderLists(searchInput.value);
    }
    
    if (e.target.matches('.remove-btn')) {
      layoutData[currentSection] = layoutData[currentSection].filter(id => id !== e.target.getAttribute('data-id'));
      renderLists(searchInput.value);
    }
  });

  // Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderLists(e.target.value));
  }

  // Save to Firebase
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
        alert("Failed to save changes.");
      } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
    });
  }
}