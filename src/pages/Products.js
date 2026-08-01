import { fetchProducts } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { debounce } from '../utils/debounce.js'; // <-- New import

// We store the fetched data locally in this module so the filter can use it
let allProducts = [];

export function Products() {
  return `
    <div>
      <div class="flex-between" style="margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-sm);">
        <h2>All Products</h2>
        <div style="display: flex; gap: var(--spacing-sm);">
          <input type="text" id="search-input" placeholder="Search products..." disabled style="padding: var(--spacing-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface); width: 250px;">
          <select id="category-filter" disabled style="padding: var(--spacing-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);">
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-2 grid-cols-4" id="product-grid" style="gap: var(--spacing-md);">
        <div style="grid-column: 1 / -1; padding: var(--spacing-lg); text-align: center; color: var(--color-text-muted);">
          Loading catalog...
        </div>
      </div>
    </div>
  `;
}

export async function initProducts() {
  const filterSelect = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  const productGrid = document.getElementById('product-grid');

  if (!filterSelect || !searchInput || !productGrid) return;

  try {
    // Fetch data and enable inputs
    allProducts = await fetchProducts();
    filterSelect.disabled = false;
    searchInput.disabled = false;

    function updateGrid() {
      const selectedCategory = filterSelect.value;
      const searchTerm = searchInput.value.toLowerCase();
      
      const filteredProducts = allProducts.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
      });

      if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <h3 style="margin-bottom: var(--spacing-sm);">No products found</h3>
            <p style="color: var(--color-text-muted);">Try adjusting your search or category filter.</p>
            <button class="btn" id="clear-filters-btn" style="margin-top: var(--spacing-md); width: auto; padding: var(--spacing-sm) var(--spacing-lg);">Clear Filters</button>
          </div>
        `;
        
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
          searchInput.value = '';
          filterSelect.value = 'All';
          updateGrid();
        });
        return;
      }

      productGrid.innerHTML = filteredProducts.map(product => ProductCard(product)).join('');
    }
    
    // Initial render and listeners
    updateGrid();
    filterSelect.addEventListener('change', updateGrid);
    
    // NEW: Wrap the search listener in the debounce function
    const debouncedSearch = debounce(updateGrid, 300);
    searchInput.addEventListener('input', debouncedSearch);
    
  } catch (error) {
    productGrid.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1;">Failed to load catalog.</p>`;
  }
}