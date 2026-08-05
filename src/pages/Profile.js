import { authStore } from '../store/authStore.js';
import { auth } from '../services/firebase.js';
import { updateProfile, updatePassword } from 'firebase/auth';

export function Profile() {
  const user = authStore.user;
  if (!user) {
    window.location.hash = '#login';
    return '';
  }

  return `
    <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <h2 style="margin-bottom: 1.5rem; text-align: center;">My Profile</h2>
      
      <form id="profile-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 4px;">Full Name</label>
          <input type="text" id="profile-name" value="${user.displayName || ''}" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px;">Email Address (Cannot be changed)</label>
          <input type="email" value="${user.email}" disabled style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-muted); opacity: 0.7; cursor: not-allowed;">
        </div>

        <div style="margin-top: 1rem; border-top: 1px solid var(--color-border); padding-top: 1rem;">
          <button type="button" id="toggle-password-section" style="background: none; border: none; color: var(--color-primary); cursor: pointer; font-weight: bold; padding: 0; font-size: 1rem;">+ Change Password</button>
        </div>

        <div id="password-update-section" style="display: none; flex-direction: column; gap: 10px; margin-top: 0.5rem;">
          <label style="display: block; margin-bottom: 4px;">New Password</label>
          <div style="position: relative;">
            <input type="password" id="profile-new-password" placeholder="Enter new password" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); padding-right: 40px;">
            <button type="button" id="toggle-profile-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 1.2rem;">👁️</button>
          </div>
          <small style="color: var(--color-text-muted); font-size: 0.8rem;">* Password must be at least 6 characters long.</small>
        </div>

        <button type="submit" class="btn" style="margin-top: 1.5rem;">Save Changes</button>
      </form>
    </div>
  `;
}

export function initProfile() {
  const form = document.getElementById('profile-form');
  const passSectionToggle = document.getElementById('toggle-password-section');
  const passSection = document.getElementById('password-update-section');
  const passInput = document.getElementById('profile-new-password');
  const passEyeToggle = document.getElementById('toggle-profile-password');

  if (!form) return;

  // 1. Toggle Password Section Visibility
  if (passSectionToggle && passSection) {
    passSectionToggle.addEventListener('click', () => {
      const isHidden = passSection.style.display === 'none';
      passSection.style.display = isHidden ? 'flex' : 'none';
      passSectionToggle.textContent = isHidden ? '- Cancel Password Change' : '+ Change Password';
      if (!isHidden) passInput.value = ''; // Clear input if they close it
    });
  }

  // 2. Toggle Eye Icon (Show/Hide Text)
  if (passEyeToggle && passInput) {
    passEyeToggle.addEventListener('click', () => {
      const isPassword = passInput.getAttribute('type') === 'password';
      passInput.setAttribute('type', isPassword ? 'text' : 'password');
      passEyeToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // 3. Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    const newName = document.getElementById('profile-name').value;
    const newPassword = passInput.value;

    try {
      btn.textContent = 'Saving...';
      btn.disabled = true;

      if (newName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: newName });
        authStore.user.displayName = newName; 
      }

      // Only update password if the section is open and they typed something
      if (passSection.style.display === 'flex' && newPassword.length > 0) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        await updatePassword(auth.currentUser, newPassword);
      }

      alert("Profile updated successfully!");
      window.dispatchEvent(new Event('hashchange')); 

    } catch (error) {
      // Handle Firebase's strict security rules for passwords
      if (error.code === 'auth/requires-recent-login') {
        alert("Security Alert: Your login session is too old to change your password. Please log out, log back in, and try again.");
      } else {
        alert("Error updating profile: " + error.message);
      }
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}