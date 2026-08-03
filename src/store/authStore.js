import { auth } from '../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const authStore = {
  user: null,

  init() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
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