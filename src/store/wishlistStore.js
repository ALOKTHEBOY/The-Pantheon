const savedWishlist = JSON.parse(localStorage.getItem('novacart_wishlist')) || [];

export const wishlistStore = {
  items: savedWishlist,

  save() {
    localStorage.setItem('novacart_wishlist', JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  },

  toggle(product) {
    const exists = this.items.find(item => item.id === product.id);
    if (exists) {
      this.items = this.items.filter(item => item.id !== product.id);
    } else {
      this.items.push(product);
    }
    this.save();
  },

  hasItem(productId) {
    return this.items.some(item => item.id === productId);
  }
};