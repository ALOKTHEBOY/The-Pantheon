// src/components/Dropdown.js

/**
 * Generates the HTML for a dropdown menu.
 * @param {Object} config - The dropdown configuration.
 * @param {string} config.id - A unique identifier for the dropdown.
 * @param {string} config.label - The text displayed on the main button.
 * @param {Array} config.items - An array of objects { label: string, link: string }.
 */
export function Dropdown({ id, label, items }) {
  // Generate the HTML string for the items
  const menuItemsHtml = items.map(item => `
    <a href="${item.link}" class="dropdown-item">${item.label}</a>
  `).join('');

  // Return the complete dropdown structure
  return `
    <div class="dropdown-wrapper" id="dropdown-${id}">
      <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
        ${label}
        <span class="dropdown-chevron">▼</span>
      </button>
      <div class="dropdown-menu" role="menu">
        ${menuItemsHtml}
      </div>
    </div>
  `;
}

/**
 * Initializes mobile-friendly click listeners for all dropdowns.
 * This ensures menus open on tap and close when tapping outside.
 */
export function initDropdowns() {
  document.addEventListener('click', (e) => {
    const toggleButton = e.target.closest('.dropdown-toggle');
    const allDropdowns = document.querySelectorAll('.dropdown-wrapper');

    // If the user clicked completely outside any dropdown, close them all
    if (!toggleButton) {
      allDropdowns.forEach(dropdown => dropdown.classList.remove('is-active'));
      return;
    }

    // Find the specific wrapper of the clicked button
    const currentWrapper = toggleButton.closest('.dropdown-wrapper');
    const isCurrentlyActive = currentWrapper.classList.contains('is-active');

    // Close all dropdowns first to ensure only one is open at a time
    allDropdowns.forEach(dropdown => dropdown.classList.remove('is-active'));

    // If it wasn't already active, open it
    if (!isCurrentlyActive) {
      currentWrapper.classList.add('is-active');
    }
  });
}