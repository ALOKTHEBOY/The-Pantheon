import { auth } from '../services/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export function Login() {
  return `
    <div style="max-width: 400px; margin: 2rem auto; padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="text-align: center; margin-bottom: var(--spacing-md);">Welcome Back</h2>
      
      <form id="login-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
        <div>
          <label for="login-email" style="display: block; margin-bottom: var(--spacing-xs); color: var(--color-text-muted);">Email Address</label>
          <input type="email" id="login-email" required style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main);">
        </div>
        
        <div>
          <label for="login-password" style="display: block; margin-bottom: var(--spacing-xs); color: var(--color-text-muted);">Password</label>
          <div style="position: relative;">
            <input type="password" id="login-password" required style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); padding-right: 40px;">
            <button type="button" id="toggle-login-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 1.2rem;">👁️</button>
          </div>
        </div>
        
        <button type="submit" class="btn" style="width: 100%; margin-top: var(--spacing-sm);">Sign In</button>
      </form>
      
      <p style="text-align: center; margin-top: var(--spacing-md); color: var(--color-text-muted); font-size: 0.9rem;">
        Don't have an account? <a href="#register" style="color: var(--color-primary); text-decoration: none;">Create one here</a>
      </p>
    </div>
  `;
}

export function initLogin() {
  const toggleBtn = document.getElementById('toggle-login-password');
  const passwordInput = document.getElementById('login-password');
  
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = passwordInput.value;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Signing In...';
      btn.disabled = true;
      await signInWithEmailAndPassword(auth, email, password);
      window.location.hash = '#'; 
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}