import { authStore } from '../../store/authStore.js';
import { auth } from '../../services/firebase.js';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth'; // NEW IMPORT
import { showToast } from '../../utils/toast.js';
import { settingsStore } from '../../store/settingsStore.js';

export function ProfileSettings() {
  const user = authStore.user;
  const isMuted = settingsStore.isMuted;
  
  return `
    <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <h2 style="margin-bottom: 1.5rem;">Account Settings</h2>
      
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- PROFILE UPDATE SECTION -->
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <form id="update-profile-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-text-main); margin-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Public Profile</h3>
            
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: bold;">Display Name</label>
              <input type="text" id="setting-display-name" value="${user?.displayName || ''}" required placeholder="Enter your full name" style="width: 100%; max-width: 400px; padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
              <small style="display: block; color: var(--color-text-muted); margin-top: 6px; font-size: 0.8rem;">This is the name that appears in the header and your order history.</small>
            </div>

            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: bold;">Email Address</label>
              <input type="email" value="${user?.email || ''}" disabled style="width: 100%; max-width: 400px; padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-muted); opacity: 0.7; cursor: not-allowed;">
            </div>

            <div style="margin-top: 1rem;">
              <button type="submit" id="update-profile-btn" class="btn" style="max-width: 200px;">Save Changes</button>
            </div>
          </form>
        </div>

        <!-- PASSWORD & SECURITY SECTION -->
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
           <h3 style="font-size: 1.1rem; color: var(--color-text-main); margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Security</h3>
           
           <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5;">
             To ensure your account remains secure, password changes are handled via email verification. Click the button below to receive a secure password reset link.
           </p>

           <button type="button" id="reset-password-btn" class="btn" style="max-width: 250px; background: var(--color-text-main); color: var(--color-background);">
             Send Password Reset Email
           </button>
        </div>

        <!-- PREFERENCES SECTION -->
        <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
           <h3 style="font-size: 1.1rem; color: var(--color-text-main); margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Preferences</h3>
           
           <!-- Sound Effect Toggle -->
           <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
             <div>
               <div style="font-weight: bold; font-size: 1rem;">Application Sounds</div>
               <div style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 4px;">Play sound effects for cart actions and notifications.</div>
             </div>
             
             <button id="toggle-sound-btn" class="btn" style="background: ${isMuted ? 'var(--color-surface)' : 'var(--color-primary)'}; color: ${isMuted ? 'var(--color-text-main)' : 'white'}; border: 2px solid ${isMuted ? 'var(--color-border)' : 'var(--color-primary)'}; width: 140px; font-weight: bold; padding: 8px 16px;">
               ${isMuted ? '🔇 Muted' : '🔊 Sound On'}
             </button>
           </div>
        </div>

      </div>
    </div>
  `;
}

export async function initProfileSettings() {
  const profileForm = document.getElementById('update-profile-form');
  const nameInput = document.getElementById('setting-display-name');
  const submitBtn = document.getElementById('update-profile-btn');
  const resetPasswordBtn = document.getElementById('reset-password-btn');

  const soundBtn = document.getElementById('toggle-sound-btn');

  const currentUser = auth.currentUser;

  // 1. Handle Profile Name Update
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newName = nameInput.value.trim();

      if (!currentUser) return showToast("Authentication error. Please log in again.");
      if (newName === currentUser.displayName) return showToast("No changes made.");

      const originalText = submitBtn.textContent;
      try {
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        await updateProfile(currentUser, { displayName: newName });
        if (authStore.user) authStore.user.displayName = newName;
        window.dispatchEvent(new Event('authStateChanged'));
        
        showToast("Profile updated successfully!");
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // 2. Handle Password Reset Link
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async () => {
      if (!currentUser || !currentUser.email) return;

      const originalText = resetPasswordBtn.textContent;
      try {
        resetPasswordBtn.textContent = 'Sending Link...';
        resetPasswordBtn.disabled = true;

        await sendPasswordResetEmail(auth, currentUser.email);
        
        showToast("Password reset email sent! Check your inbox.");
        resetPasswordBtn.textContent = 'Email Sent ✓';
        resetPasswordBtn.style.background = '#10b981'; // Green success color
        
      } catch (error) {
        alert("Error sending reset email: " + error.message);
        resetPasswordBtn.textContent = originalText;
        resetPasswordBtn.disabled = false;
      }
    });
  }

  // 3. Handle Sound Toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      settingsStore.toggleMute();
      // Re-render to update the button UI
      window.dispatchEvent(new Event('hashchange')); 
    });
  }
}