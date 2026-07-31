import { cartStore } from '../store/cartStore.js';

export function Header() {
  const totalItems = cartStore.getTotalItems();
  
  return `
    <header class="header">
      <div class="container flex-between">
        <h2 style="color: var(--color-primary);">NovaCart Pro</h2>
        <nav>
          <ul class="nav-list">
            <li><a href="#" class="nav-link active">Home</a></li>
            <li><a href="#products" class="nav-link">Products</a></li>
            <li><a href="#cart" class="nav-link" id="cart-count">Cart (${totalItems})</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `;
}