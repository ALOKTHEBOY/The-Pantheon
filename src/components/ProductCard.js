import { formatCurrency } from '../utils/formatCurrency.js';

export function ProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <h4>${product.name}</h4>
      <p class="price">${formatCurrency(product.price)}</p>
      <button class="btn">Add to Cart</button>
    </div>
  `;
}