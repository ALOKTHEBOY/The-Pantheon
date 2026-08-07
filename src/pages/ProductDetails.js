import { db } from '../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { cartStore } from '../store/cartStore.js';

export function ProductDetails() {
  return `
    <div id="product-details-container" style="max-width: 1000px; margin: 2rem auto; padding: 0 var(--spacing-md);">
      <p style="color: var(--color-text-muted);">Loading product...</p>
    </div>
  `;
}

export async function initProductDetails(productId) {
  const container = document.getElementById('product-details-container');
  if (!container) return;

  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      container.innerHTML = '<h2 style="text-align: center; margin-top: 2rem;">Product not found</h2>';
      return;
    }

    const product = { id: docSnap.id, ...docSnap.data() };
    const hasDiscount = product.discountPercentage > 0;
    const aboutText = product.about ? product.about.trim() : 'No detailed description available.';
    
    // Gather all available images into an array
    const images = product.images && product.images.length > 0 
      ? product.images 
      : [product.image || 'https://via.placeholder.com/400'];

    container.innerHTML = `
      <a href="#/products" style="display: inline-block; margin-bottom: var(--spacing-lg); color: var(--color-text-muted); text-decoration: none;">← Back to Catalog</a>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;">
        
        <!-- Left: Image Gallery -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--spacing-md); border: 1px solid var(--color-border); position: relative; height: 350px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${hasDiscount ? `<div style="position: absolute; top: 20px; left: 20px; background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 1rem; z-index: 1;">🔥 ${product.discountPercentage}% OFF SALE</div>` : ''}
            <img id="main-product-image" src="${images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--radius-md);">
          </div>
          
          <!-- Thumbnail Row -->
          ${images.length > 1 ? `
            <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;">
              ${images.map((imgUrl, index) => `
                <img class="gallery-thumb" src="${imgUrl}" data-index="${index}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${index === 0 ? 'var(--color-primary)' : 'var(--color-border)'}; transition: border-color 0.2s;">
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Right: Details -->
        <div>
          <div style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1px; margin-bottom: 5px;">
            ${product.category || 'Other'}
          </div>
          <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-md); line-height: 1.2;">${product.name}</h1>
          
          <div style="margin-bottom: var(--spacing-lg); padding: 15px; background: var(--color-background); border-left: 4px solid var(--color-primary); border-radius: 4px;">
            ${hasDiscount ? `
              <div style="color: var(--color-text-muted); font-size: 1.1rem; margin-bottom: 5px;">
                Original Price: <strike>₹${parseFloat(product.originalPrice).toFixed(2)}</strike>
              </div>
            ` : ''}
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary);">
              ${hasDiscount ? 'Final Price: ' : ''}₹${parseFloat(product.price).toFixed(2)}
            </div>
          </div>

          <div style="margin-bottom: var(--spacing-lg);">
            <h3 style="margin-bottom: 10px; font-size: 1.2rem;">About this item</h3>
            <div style="color: var(--color-text-main); line-height: 1.6; text-align: left; background: var(--color-surface); padding: 15px; border-radius: 8px; border: 1px solid var(--color-border);">
              <p id="about-text-content" style="margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; transition: all 0.3s ease;">
                ${aboutText}
              </p>
              <button id="read-more-btn" style="background: none; border: none; color: var(--color-primary); cursor: pointer; padding: 5px 0 0 0; font-weight: bold; margin-top: 5px;">Read More</button>
            </div>
          </div>

          <button id="add-to-cart-detail" class="btn" style="width: 100%; font-size: 1.1rem; padding: 15px;">Add to Cart</button>
        </div>
      </div>
    `;

    // Interactive Thumbnail Switching Logic
    if (images.length > 1) {
      const mainImg = document.getElementById('main-product-image');
      const thumbs = document.querySelectorAll('.gallery-thumb');
      
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          thumbs.forEach(t => t.style.borderColor = 'var(--color-border)');
          e.target.style.borderColor = 'var(--color-primary)';
          mainImg.src = e.target.src;
        });
      });
    }

    document.getElementById('add-to-cart-detail').addEventListener('click', () => {
      cartStore.addToCart(product);
      alert(`${product.name} added to cart!`);
    });

    const readMoreBtn = document.getElementById('read-more-btn');
    const aboutContent = document.getElementById('about-text-content');
    
    if (readMoreBtn && aboutContent) {
      if (aboutContent.scrollHeight <= aboutContent.clientHeight) {
        readMoreBtn.style.display = 'none';
      } else {
        readMoreBtn.addEventListener('click', () => {
          if (aboutContent.style.webkitLineClamp === '3') {
            aboutContent.style.webkitLineClamp = 'unset';
            readMoreBtn.textContent = 'Read Less';
          } else {
            aboutContent.style.webkitLineClamp = '3';
            readMoreBtn.textContent = 'Read More';
          }
        });
      }
    }

  } catch (error) {
    container.innerHTML = `<h2 style="color: red; text-align: center; margin-top: 2rem;">Error: ${error.message}</h2>`;
  }
}