import { products } from '../utils/data.js';
import { ProductCard } from '../components/ProductCard.js';

export function Products() {
  const productGridHTML = products.map(product => ProductCard(product)).join('');

  return `
    <div>
      <div class="flex-between" style="margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-sm);">
        <h2>All Products</h2>
        <div style="display: flex; gap: var(--spacing-sm);">
          <input type="text" id="search-input" placeholder="Search products..." style="padding: var(--spacing-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface); width: 250px;">
          <select id="category-filter" style="padding: var(--spacing-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);">
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-2 grid-cols-4" id="product-grid" style="gap: var(--spacing-md);">
        ${productGridHTML}
      </div>
    </div>
  `;
}

export function initProducts() {
  const filterSelect = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  const productGrid = document.getElementById('product-grid');

  if (!filterSelect || !searchInput || !productGrid) return;

  // Centralized filter logic
  function updateGrid() {
    const selectedCategory = filterSelect.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredProducts = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      
      return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = filteredProducts.map(product => ProductCard(product)).join('');
  }

  // Listen to both inputs
  filterSelect.addEventListener('change', updateGrid);
  searchInput.addEventListener('input', updateGrid); // 'input' fires on every keystroke
}