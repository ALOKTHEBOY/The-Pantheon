export const cartStore = {
  items: [],
  
  addToCart(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    
    console.log("Cart Updated:", this.items);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },
  
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};