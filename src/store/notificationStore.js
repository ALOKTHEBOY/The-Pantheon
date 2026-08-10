import { settingsStore } from './settingsStore.js';

// Define a key for localStorage
const STORAGE_KEY = 'novacart_notifications';

// Load initial state from LocalStorage or default to an empty array
const savedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

export const notificationStore = {
  notifications: savedNotifications,

  // Save to memory and tell the app to update the UI
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  },

  // NEW: Accepts a custom sound, defaults to 'notify'
  addNotification(text, soundType = 'notify') {
    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newNotif = {
      id: Date.now(),
      text: text,
      read: false,
      time: timeString
    };
    
    this.notifications.unshift(newNotif);
    
    if (this.notifications.length > 15) {
      this.notifications.pop();
    }
    
    // Play the specific sound requested (or skip if 'none')
    if (soundType !== 'none') {
      settingsStore.playSound(soundType);
    }
    
    this.save();
  },

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },

  markAllAsRead() {
    let changed = false;
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    });
    
    // Only save and re-render if something actually changed
    if (changed) {
      this.save();
    }
  }
};