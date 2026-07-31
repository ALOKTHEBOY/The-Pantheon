import { formatCurrency } from '../utils/formatCurrency.js';

export function CartItem(item) {
  return `
    <div class="flex-between" style="padding: var(--spacing-md) 0; border-bottom: 1px solid var(--color-border);">
      <div>
        <h4 style="margin-bottom: var(--spacing-sm);">${item.name}</h4>
        <p class="price">${formatCurrency(item.price)} x ${item.quantity}</p>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: bold; margin-bottom: var(--spacing-sm);">${formatCurrency(item.price * item.quantity)}</p>
        <button class="btn remove-btn" data-id="${item.id}" style="background: #ef4444; padding: 0.25rem 0.5rem; font-size: 0.875rem; width: auto;">Remove</button>
      </div>
    </div>
  `;
}