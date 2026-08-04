import { getProductById } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export function ProductDetails() {
  return `
    <div style="margin-bottom: var(--spacing-md);">
      <a href="#products" style="color: var(--color-text-muted); text-decoration: none;">← Back to Catalog</a>
    </div>
    
    <div id="product-detail-container" style="background: var(--color-surface); padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center; color: var(--color-text-muted);">
      Loading product details...
    </div>
  `;
}

export async function initProductDetails(id) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  try {
    const product = await getProductById(id);

    if (!product) {
      container.innerHTML = `
        <h2>Product not found</h2>
        <a href="#products" style="color: var(--color-primary); margin-top: var(--spacing-md); display: inline-block;">Back to Products</a>
      `;
      return;
    }

    container.style.textAlign = 'left';
    container.innerHTML = `
      <div class="grid grid-cols-2" style="gap: var(--spacing-lg);">
        <div>
          <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-md);">
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-sm); text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em;">${product.category}</p>
          <h2 style="font-size: 2.5rem; margin-bottom: var(--spacing-md); line-height: 1.2;">${product.name}</h2>
          <h3 class="price" style="font-size: 1.75rem; margin-bottom: var(--spacing-lg);">${formatCurrency(product.price)}</h3>
          <p style="margin-bottom: var(--spacing-lg); line-height: 1.6; color: var(--color-text-muted);">
            This is a detailed description of the ${product.name}. Built with premium materials to ensure the highest quality and durability for our customers.
          </p>
          <button class="btn add-to-cart-btn" data-id="${product.id}" style="font-size: 1.1rem; padding: var(--spacing-md);">Add to Cart</button>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<p style="color: #ef4444;">Failed to load product details.</p>`;
  }
}