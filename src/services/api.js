import { products } from '../utils/data.js';

export function fetchProducts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 800);
  });
}

// NEW: Fetch a single product
export async function getProductById(id) {
  const allProducts = await fetchProducts();
  return allProducts.find(p => p.id === id);
}