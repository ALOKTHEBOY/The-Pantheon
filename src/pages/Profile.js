import { authStore } from '../store/authStore.js';
import { auth, db } from '../services/firebase.js';
import { updateProfile, updatePassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function Profile() {
  const user = authStore.user;
  if (!user) {
    window.location.hash = '#login';
    return '';
  }

  return `
    <div style="max-width: 800px; margin: 4rem auto; padding: 0 1rem; display: grid; gap: 2rem;">
      
      <!-- Profile Settings -->
      <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
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

      <!-- Order History -->
      <div style="padding: 2rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h2 style="margin-bottom: 1.5rem;">Order History</h2>
        <div id="order-history-list" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--color-text-muted);">Loading your orders...</p>
        </div>
      </div>
      
    </div>
  `;
}

export async function initProfile() {
  const form = document.getElementById('profile-form');
  const passSectionToggle = document.getElementById('toggle-password-section');
  const passSection = document.getElementById('password-update-section');
  const passInput = document.getElementById('profile-new-password');
  const passEyeToggle = document.getElementById('toggle-profile-password');
  const orderList = document.getElementById('order-history-list');

  if (!form) return;

  // --- Profile UI Toggles ---
  if (passSectionToggle && passSection) {
    passSectionToggle.addEventListener('click', () => {
      const isHidden = passSection.style.display === 'none';
      passSection.style.display = isHidden ? 'flex' : 'none';
      passSectionToggle.textContent = isHidden ? '- Cancel Password Change' : '+ Change Password';
      if (!isHidden) passInput.value = ''; 
    });
  }

  if (passEyeToggle && passInput) {
    passEyeToggle.addEventListener('click', () => {
      const isPassword = passInput.getAttribute('type') === 'password';
      passInput.setAttribute('type', isPassword ? 'text' : 'password');
      passEyeToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // --- Profile Form Submission ---
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

      if (passSection.style.display === 'flex' && newPassword.length > 0) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        await updatePassword(auth.currentUser, newPassword);
      }

      alert("Profile updated successfully!");
      window.dispatchEvent(new Event('hashchange')); 

    } catch (error) {
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

  // --- Order History Fetching ---
  if (orderList && authStore.user) {
    try {
      // Query Firestore for orders matching the current user's email
      const q = query(collection(db, "orders"), where("email", "==", authStore.user.email));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort newest to oldest
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (orders.length === 0) {
        orderList.innerHTML = '<p style="color: var(--color-text-muted);">You have not placed any orders yet.</p>';
        return;
      }

      orderList.innerHTML = orders.map(order => {
        const statusColors = { pending: '#f59e0b', shipped: '#3b82f6', delivered: '#10b981' };
        const currentStatus = order.status || 'pending';
        const badgeColor = statusColors[currentStatus];
        
        return `
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem; background: var(--color-background);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <div>
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Order ID: ${order.id}</span>
              <span style="background: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; margin-left: 10px; text-transform: uppercase;">${currentStatus}</span>
            </div>
            <span style="font-weight: bold; color: var(--color-primary);">₹${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
          </div>
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem;">
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div style="font-size: 0.9rem;">
            <strong>Items:</strong>
            <ul style="margin-top: 4px; padding-left: 20px; color: var(--color-text-muted);">
              ${(order.items || []).map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
            </ul>
          </div>
        </div>
      `}).join('');

    } catch (error) {
      orderList.innerHTML = '<p style="color: #ef4444;">Failed to load order history.</p>';
    }
  }
}