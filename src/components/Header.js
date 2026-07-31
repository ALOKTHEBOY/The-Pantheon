export function Header() {
  return `
    <header class="header">
      <div class="container flex-between">
        <h2 style="color: var(--color-primary);">NovaCart Pro</h2>
        <nav>
          <ul class="nav-list">
            <li><a href="#" class="nav-link active">Home</a></li>
            <li><a href="#products" class="nav-link">Products</a></li>
            <li><a href="#cart" class="nav-link">Cart (0)</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `;
}