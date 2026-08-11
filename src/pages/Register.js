import { auth } from '../services/firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { notificationStore } from '../store/notificationStore.js'; // NEW IMPORT

export function Register() {
  return `
    <div style="max-width: 400px; margin: 2rem auto; padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="text-align: center; margin-bottom: var(--spacing-md);">Create Account</h2>
      
      <form id="register-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
        <div>
          <label for="register-name" style="display: block; margin-bottom: var(--spacing-xs); color: var(--color-text-muted);">Full Name</label>
          <input type="text" id="register-name" required style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
        </div>

        <div>
          <label for="register-email" style="display: block; margin-bottom: var(--spacing-xs); color: var(--color-text-muted);">Email Address</label>
          <input type="email" id="register-email" required style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
        </div>
        
        <div>
          <label for="register-password" style="display: block; margin-bottom: var(--spacing-xs); color: var(--color-text-muted);">Password (Min. 6 characters)</label>
          <div style="position: relative;">
            <input type="password" id="register-password" minlength="6" required style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); padding-right: 40px;">
            <button type="button" id="toggle-register-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 1.2rem;">👁️</button>
          </div>
        </div>
        
        <button type="submit" class="btn" style="width: 100%; margin-top: var(--spacing-sm);">Sign Up</button>
      </form>
      
      <p style="text-align: center; margin-top: var(--spacing-md); color: var(--color-text-muted); font-size: 0.9rem;">
        Already have an account? <a href="#/login" style="color: var(--color-primary); text-decoration: none;">Sign in here</a>
      </p>
    </div>
  `;
}

export function initRegister() {
  const toggleBtn = document.getElementById('toggle-register-password');
  const passwordInput = document.getElementById('register-password');
  
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = passwordInput.value;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Creating Account...';
      btn.disabled = true;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name }); 
      
      // NEW: Trigger a welcome notification for new users
      notificationStore.addNotification(`Welcome to The Pantheon, ${name}! Your vault access is now active.`, 'notify');
      
      window.location.hash = '#';
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}