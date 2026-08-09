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

  // NEW: The function we will call to trigger a new alert!
  addNotification(text) {
    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newNotif = {
      id: Date.now(),
      text: text,
      read: false,
      time: timeString
    };
    
    // Add to the beginning of the list (newest first)
    this.notifications.unshift(newNotif);
    
    // Cap it at 15 notifications so the dropdown doesn't get infinitely long
    if (this.notifications.length > 15) {
      this.notifications.pop();
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