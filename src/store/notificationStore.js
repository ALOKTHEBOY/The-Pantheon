import { db, auth } from '../services/firebase.js';
import { collection, addDoc, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { settingsStore } from './settingsStore.js';

export const notificationStore = {
  notifications: [],
  unsubscribe: null, 
  isInitialLoad: true, // Tracks initial fetch to avoid playing sound for old notifications

  // Real-time database listener locked to the specific user
  init(userId) {
    if (!userId) return;
    this.isInitialLoad = true;
    
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    
    // onSnapshot listens to the database live
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const incoming = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort so newest notifications are at the top
      incoming.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Play sound if a brand new notification arrives after initial load
      if (!this.isInitialLoad && incoming.length > this.notifications.length) {
        settingsStore.playSound('notify');
      }

      this.notifications = incoming;
      this.isInitialLoad = false;
      
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    });
  },

  clear() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.notifications = [];
    this.isInitialLoad = true;
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  },

  async addNotification(text, soundType = 'notify', targetUserId = null) {
    const userId = targetUserId || (auth.currentUser ? auth.currentUser.uid : null);
    if (!userId) return;

    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        text: text,
        read: false,
        time: timeString,
        timestamp: Date.now()
      });

      // Play sound locally if the user is triggering a notification for themselves
      if (soundType !== 'none' && (!targetUserId || targetUserId === auth.currentUser?.uid)) {
        settingsStore.playSound(soundType);
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },

  async markAllAsRead() {
    const unread = this.notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        const ref = doc(db, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }
};