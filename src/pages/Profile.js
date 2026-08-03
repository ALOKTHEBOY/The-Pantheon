import { authStore } from '../store/authStore.js';

export function Profile() {
  const user = authStore.user;

  // Fallback safety net
  if (!user) {
    return `<div style="text-align: center; padding: 2rem;">Please <a href="#login" style="color: var(--color-primary);">login</a> to view your profile.</div>`;
  }

  return `
    <div style="max-width: 600px; margin: 2rem auto; padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">My Profile</h2>
      
      <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
        <div>
          <label style="display: block; color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 4px;">Full Name</label>
          <div style="padding: var(--spacing-sm); background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">${user.displayName || 'Not provided'}</div>
        </div>
        
        <div>
          <label style="display: block; color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 4px;">Email Address</label>
          <div style="padding: var(--spacing-sm); background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">${user.email}</div>
        </div>
        
        <div>
          <label style="display: block; color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 4px;">Account ID</label>
          <div style="padding: var(--spacing-sm); background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.85rem;">${user.uid}</div>
        </div>
      </div>
    </div>
  `;
}

export function initProfile() {
  // We will add profile editing features here later
}