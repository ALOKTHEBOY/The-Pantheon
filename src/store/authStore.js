import { auth } from '../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { notificationStore } from './notificationStore.js';

export const authStore = {
  user: null,
  isInitialized: false, // NEW: Tracks initial auth resolution

  // UPDATED: Returns a Promise to pause initial routing
  init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.user = user;

        // NEW: Sync notifications with login/logout state
        if (user) {
          notificationStore.init(user.uid);
        } else {
          notificationStore.clear();
        }

        window.dispatchEvent(new CustomEvent('authStateChanged'));

        // NEW: Resolve the promise only on the very first Firebase response
        if (!this.isInitialized) {
          this.isInitialized = true;
          resolve(user);
        }
      });
    });
  },

  async logout() {
    try {
      await signOut(auth);
      // FIXED: Exact route match
      window.location.hash = '#/login';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
};