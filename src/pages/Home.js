import { fetchProducts } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';

export function Home() {
  return `
    <div class="grid" style="gap: var(--spacing-lg);">
      <section style="background: linear-gradient(to right, #1e40af, #2563eb); color: white; padding: var(--spacing-lg); border-radius: var(--radius-md); text-align: center;">
        <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">Welcome to NovaCart Pro</h1>
        <p style="color: #93c5fd; max-width: 600px; margin: 0 auto;">Discover high-quality products built with clean Vanilla JavaScript architecture.</p>
      </section>

      <section>
        <h3 style="margin-bottom: var(--spacing-md);">Trending Products</h3>
        <div class="grid grid-cols-2 grid-cols-4" id="home-product-grid" style="gap: var(--spacing-md);">
          <div style="grid-column: 1 / -1; padding: var(--spacing-lg); text-align: center; color: var(--color-text-muted);">
            Loading products...
          </div>
        </div>
      </section>
    </div>
  `;
}

// Fetch data and inject it after the shell has rendered
export async function initHome() {
  const grid = document.getElementById('home-product-grid');
  if (!grid) return;

  try {
    const data = await fetchProducts();
    grid.innerHTML = data.map(product => ProductCard(product)).join('');
  } catch (error) {
    grid.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1;">Failed to load products.</p>`;
  }
}