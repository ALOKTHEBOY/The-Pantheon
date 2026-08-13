import { db, auth } from '../services/firebase.js';
import { collection, addDoc, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { settingsStore } from './settingsStore.js';

export const notificationStore = {
  notifications: [],
  unsubscribe: null, 

  // NEW: Real-time database listener locked to the specific user
  init(userId) {
    if (!userId) return;
    
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    
    // onSnapshot listens to the database live. No refresh needed!
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort so the newest notifications are always at the top
      this.notifications.sort((a, b) => b.timestamp - a.timestamp);
      
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    });
  },

  // NEW: Wipes the UI memory immediately on logout
  clear() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.notifications = [];
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  },

  // UPGRADED: Now saves to Firestore and can target specific users
  async addNotification(text, soundType = 'notify', targetUserId = null) {
    // If Admin sends an update, use targetUserId. Otherwise, use the logged-in user.
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
      
      // Only play the sound if the notification is for the person currently looking at the screen!
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

  // UPGRADED: Updates read status securely in the database using a Batch write
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