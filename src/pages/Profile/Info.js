import { authStore } from '../../store/authStore.js';

export function ProfileInfo() {
  const user = authStore.user;
  
  return `
    <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem;">Personal Information</h2>
      
      <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--color-border);">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; flex-shrink: 0;">
            ${user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-main);">${user?.displayName || 'Not Set'}</div>
            <div style="color: var(--color-text-muted);">${user?.email || 'N/A'}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Account Status</label>
            <div style="font-size: 1rem; color: #10b981; font-weight: bold;">✓ Active & Verified</div>
          </div>
        </div>
        
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
          <p style="color: var(--color-text-muted); font-size: 0.9rem;">Looking to update your password or display name? Please visit the <strong>Account Settings</strong> tab.</p>
        </div>
        
      </div>
    </div>
  `;
}

export function initProfileInfo() {
  // No complex DOM listeners needed here yet.
  // It relies entirely on the reactive authStore.
}