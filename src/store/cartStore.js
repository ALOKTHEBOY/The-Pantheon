export const cartStore = {
  items: [],
  
  addToCart(product) {
    // Check if the item is already in the cart
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    
    // Log for debugging
    console.log("Cart Updated:", this.items);
    
    // Announce to the rest of the app that the cart has changed
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },
  
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
};