// Load initial state from LocalStorage or default to an empty array
const savedCart = JSON.parse(localStorage.getItem('novacart_items')) || [];

export const cartStore = {
  items: savedCart,
  
  save() {
    localStorage.setItem('novacart_items', JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  addToCart(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  },

  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  },

  clearCart() {
    this.items = [];
    this.save();
  },
  
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};