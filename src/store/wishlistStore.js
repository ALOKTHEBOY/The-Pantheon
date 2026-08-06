import { db } from '../services/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { authStore } from './authStore.js';

class WishlistStore {
  constructor() {
    this.items = [];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.items));
    // Dispatch a global event so the UI knows to re-render the heart icons
    window.dispatchEvent(new Event('wishlistUpdated')); 
  }

  // Fetch the logged-in user's wishlist from Firestore
  async loadWishlist() {
    if (!authStore.user) {
      this.items = [];
      this.notify();
      return;
    }
    
    try {
      const docRef = doc(db, 'wishlists', authStore.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.items = docSnap.data().items || [];
      } else {
        this.items = [];
      }
      this.notify();
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }

  // Push the current items array to Firestore
  async saveWishlist() {
    if (!authStore.user) return;
    try {
      const docRef = doc(db, 'wishlists', authStore.user.uid);
      await setDoc(docRef, { items: this.items });
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }

  hasItem(productId) {
    return this.items.some(item => item.id === productId);
  }

  // FIXED: Renamed from toggleItem to toggle to match main.js
  async toggle(product) {
    if (!authStore.user) {
      alert("Please log in to save items to your wishlist.");
      window.location.hash = '#login';
      return;
    }

    const index = this.items.findIndex(item => item.id === product.id);
    
    if (index > -1) {
      this.items.splice(index, 1); // It exists, so remove it
    } else {
      this.items.push(product); // It does not exist, so add it
    }
    
    this.notify();
    await this.saveWishlist();
  }
}

export const wishlistStore = new WishlistStore();