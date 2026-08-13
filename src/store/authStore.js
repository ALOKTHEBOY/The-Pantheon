import { auth } from '../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { notificationStore } from './notificationStore.js';

export const authStore = {
  user: null,

  init() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      
      // NEW: Sync notifications with login/logout state
      if (user) {
        notificationStore.init(user.uid);
      } else {
        notificationStore.clear();
      }
      
      window.dispatchEvent(new CustomEvent('authStateChanged'));
    });
  },

  async logout() {
    try {
      await signOut(auth);
      window.location.hash = '#login';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
};