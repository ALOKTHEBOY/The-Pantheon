import { products } from '../utils/data.js';
import { ProductCard } from '../components/ProductCard.js';

export function Home() {
  // Map over the products array and join the resulting strings
  const productGridHTML = products.map(product => ProductCard(product)).join('');

  return `
    <div class="grid" style="gap: var(--spacing-lg);">
      <section style="background: linear-gradient(to right, #1e40af, #2563eb); color: white; padding: var(--spacing-lg); border-radius: var(--radius-md); text-align: center;">
        <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">Welcome to NovaCart Pro</h1>
        <p style="color: #93c5fd; max-width: 600px; margin: 0 auto;">Discover high-quality products built with clean Vanilla JavaScript architecture.</p>
      </section>
      
      <section>
        <h3 style="margin-bottom: var(--spacing-md);">Featured Categories</h3>
        <div class="grid grid-cols-2" style="gap: var(--spacing-md);">
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center;">Electronics</div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center;">Apparel</div>
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: var(--spacing-md);">Trending Products</h3>
        <div class="grid grid-cols-2 grid-cols-4" style="gap: var(--spacing-md);">
          ${productGridHTML}
        </div>
      </section>
    </div>
  `;
}