import { formatCurrency } from '../utils/formatCurrency.js';

export function ProductCard(product) {
  return `
    <div class="product-card">
      <a href="#product/${product.id}" style="text-decoration: none; color: inherit;">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h4>${product.name}</h4>
      </a>
      <p class="price">${formatCurrency(product.price)}</p>
      <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
}