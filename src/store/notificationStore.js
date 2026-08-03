export const notificationStore = {
  // Simulating database notifications for now
  notifications: [
    { id: 1, text: "Welcome to NovaCart Pro!", read: false, time: "Just now" },
    { id: 2, text: "Price dropped on Wireless Headphones! 🔥", read: false, time: "2 hours ago" },
    { id: 3, text: "Your recent order has shipped.", read: true, time: "1 day ago" }
  ],

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};