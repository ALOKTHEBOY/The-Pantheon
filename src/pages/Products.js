import { products } from '../utils/data.js';
import { ProductCard } from '../components/ProductCard.js';

export function Products() {
  const productGridHTML = products.map(product => ProductCard(product)).join('');

  return `
    <div>
      <div class="flex-between" style="margin-bottom: var(--spacing-md);">
        <h2>All Products</h2>
        <select id="category-filter" style="padding: var(--spacing-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);">
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
        </select>
      </div>
      
      <div class="grid grid-cols-2 grid-cols-4" id="product-grid" style="gap: var(--spacing-md);">
        ${productGridHTML}
      </div>
    </div>
  `;
}

// Attach event listeners AFTER the HTML is in the DOM
export function initProducts() {
  const filterSelect = document.getElementById('category-filter');
  const productGrid = document.getElementById('product-grid');

  if (!filterSelect || !productGrid) return;

  filterSelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    
    // Filter data based on selection
    const filteredProducts = selectedCategory === 'All' 
      ? products 
      : products.filter(product => product.category === selectedCategory);

    // Re-render only the grid
    productGrid.innerHTML = filteredProducts.map(product => ProductCard(product)).join('');
  });
}