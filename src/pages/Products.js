import { fetchProducts } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';

export function Products() {
  return `
    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <h2>All Products</h2>
        
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <input type="text" id="search-input" placeholder="Search products..." style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
          
          <select id="category-filter" style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="apparel">Apparel</option>
            <option value="home">Home</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="toys">Toys & Games</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
            <option value="outfits">Outfits</option>
          </select>

          <select id="sort-filter" style="padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-a-z">Name: A-Z</option>
            <option value="offer">Highest Discount</option>
          </select>
        </div>
      </div>

      <!-- FIXED: Changed grid to use fixed width (280px) to prevent stretching -->
      <div id="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, 280px); gap: 2rem; justify-content: center;">
        <p style="color: var(--color-text-muted);">Loading products...</p>
      </div>
      
    </div>
  `;
}

export async function initProducts() {
  const grid = document.getElementById('products-grid');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  const categorySelect = document.getElementById('category-filter'); // Check your exact ID for the category dropdown
  const searchInput = document.getElementById('search-input'); // Check your exact ID

  // 1. NEW: Read the URL for any category parameters sent from the Home Banner
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const requestedCategory = urlParams.get('category');

  if (!grid) return;

  let allProducts = []; 

  try {
    allProducts = await fetchProducts();
    render(allProducts); 
  } catch (error) {
    grid.innerHTML = `<p style="color: #ef4444;">Failed to load products: ${error.message}</p>`;
  }

  if (requestedCategory && categorySelect) {
    // 2. Auto-select the dropdown to match the banner link
    categorySelect.value = requestedCategory;
  }

  function render(productsToRender) {
    if (productsToRender.length === 0) {
      // FIXED: Added Clear Filters Button UI
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
          <h3 style="margin-bottom: 1rem; color: var(--color-text-main);">No products found</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Try adjusting your search or category filter.</p>
          <button id="clear-filters-btn" class="btn">Clear Filters</button>
        </div>
      `;
      
      // Wire up the Clear Filters button
      const clearBtn = document.getElementById('clear-filters-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          categoryFilter.value = 'all';
          sortFilter.value = 'default';
          applyFilters(); // Re-run filters
        });
      }
      return;
    }
    grid.innerHTML = productsToRender.map(product => ProductCard(product)).join('');
  }

  // 3. Your existing filter function (make sure this gets called after setting the value!)
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sortBy = sortFilter.value;

    let filtered = allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      const productCategory = product.category ? product.category.toLowerCase() : 'other';
      const matchesCategory = category === 'all' || productCategory === category;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-a-z') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'offer') {
      filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }

    render(filtered); 
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
  if (sortFilter) sortFilter.addEventListener('change', applyFilters);

  // Initial render
  applyFilters();
}