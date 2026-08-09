import { db } from '../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { cartStore } from '../store/cartStore.js';
import { wishlistStore } from '../store/wishlistStore.js'; // NEW IMPORT

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
      
      <div class="product-details-grid">
        
        <!-- Left: Image Gallery -->
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <div class="gallery-container" id="gallery-main-container">
            ${hasDiscount ? `<div style="position: absolute; top: 20px; left: 20px; background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 1rem; z-index: 1;">🔥 ${product.discountPercentage}% OFF</div>` : ''}
            
            <button id="detail-wishlist-btn" style="position: absolute; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 1.2rem;">
              🤍
            </button>

            ${images.length > 1 ? `
              <button class="gallery-nav-btn gallery-prev" id="gallery-prev">❮</button>
              <button class="gallery-nav-btn gallery-next" id="gallery-next">❯</button>
            ` : ''}
            
            <img id="main-product-image" src="${images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: opacity 0.2s ease-in-out;">
          </div>
          
          <!-- Thumbnail Row (Fixed for 10 images) -->
          ${images.length > 1 ? `
            <div id="gallery-thumbnails" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
              ${images.map((imgUrl, index) => `
                <img class="gallery-thumb" src="${imgUrl}" data-index="${index}" style="flex-shrink: 0; width: 70px; height: 70px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${index === 0 ? 'var(--color-primary)' : 'var(--color-border)'}; transition: border-color 0.2s;">
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Right: Details & Purchase Actions (Fixed grid blowout) -->
        <div style="min-width: 0;">
          <div style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1px; margin-bottom: 5px;">
            ${product.category || 'Other'}
          </div>
          
          <!-- UPGRADED: Title with CSS Line Clamp & Expand Button -->
          <div style="margin-bottom: 0.5rem;">
            <h1 id="product-title-content" title="${product.name}" style="font-size: clamp(1.6rem, 5vw, 2.2rem); margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease;">
              ${product.name}
            </h1>
            <button id="toggle-title-btn" style="background: none; border: none; color: var(--color-primary); cursor: pointer; padding: 4px 0 0 0; font-size: 0.85rem; font-weight: bold; display: none;">Show full name</button>
          </div>
          
          <!-- Trust Indicators -->
          <div style="display: flex; gap: 15px; margin-bottom: 1.5rem; font-size: 0.85rem; color: #10b981; font-weight: bold; flex-wrap: wrap;">
            <span>✓ Quality Assured</span>
            <span>✓ Secure Checkout</span>
          </div>
          
          <!-- Highlighted Pricing -->
          <div style="margin-bottom: 1.5rem; padding: 15px; background: var(--color-surface); border-left: 4px solid var(--color-primary); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            ${hasDiscount ? `
              <div style="color: var(--color-text-muted); font-size: 1.1rem; margin-bottom: 5px;">
                Original Price: <strike>₹${parseFloat(product.originalPrice).toFixed(2)}</strike>
              </div>
            ` : ''}
            <div style="font-size: 2.2rem; font-weight: bold; color: var(--color-primary);">
              ₹${parseFloat(product.price).toFixed(2)}
            </div>
          </div>

          <!-- UPGRADED: Quantity, Add to Cart & Buy Now -->
          <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;">
            
            <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; background: var(--color-surface); flex-shrink: 0;">
              <button id="qty-minus" style="padding: 10px 15px; background: none; border: none; cursor: pointer; font-size: 1.2rem;">-</button>
              <span id="qty-display" style="padding: 10px 15px; font-weight: bold; min-width: 40px; text-align: center;">1</span>
              <button id="qty-plus" style="padding: 10px 15px; background: none; border: none; cursor: pointer; font-size: 1.2rem;">+</button>
            </div>
            
            <div style="display: flex; gap: 0.75rem; flex: 1; min-width: 250px;">
              <button id="add-to-cart-detail" class="btn" style="flex: 1; font-size: 1rem; background: var(--color-surface); color: var(--color-primary); border: 2px solid var(--color-primary);">Add to Cart</button>
              <button id="buy-now-btn" class="btn" style="flex: 1; font-size: 1rem;">Buy Now</button>
            </div>
            
          </div>

          <!-- NEW: Key Highlights Section (Safe Fallback) -->
          ${product.highlights && product.highlights.length > 0 ? `
            <div style="margin-bottom: 2rem;">
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Key Highlights</h3>
              <ul style="margin: 0; padding-left: 20px; color: var(--color-text-main); line-height: 1.6;">
                ${product.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Description block -->
          <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 10px; font-size: 1.2rem;">About this item</h3>
            <div style="color: var(--color-text-main); line-height: 1.6; text-align: left; padding-bottom: 15px; border-bottom: 1px solid var(--color-border);">
              <p id="about-text-content" style="margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; transition: all 0.3s ease;">
                ${aboutText}
              </p>
              <button id="read-more-btn" style="background: none; border: none; color: var(--color-primary); cursor: pointer; padding: 5px 0 0 0; font-weight: bold; margin-top: 5px;">Read More</button>
            </div>
          </div>
          
          <!-- NEW: Product Video (Safe Fallback) -->
          ${product.video ? `
            <div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Product Video</h3>
              <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                <iframe src="${product.video}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    // ... (keep the read-more event listeners below this) ...

    // --- 🖼️ PART 2: SMART GALLERY LOGIC ---
    if (images.length > 1) {
      const mainImg = document.getElementById('main-product-image');
      const thumbs = document.querySelectorAll('.gallery-thumb');
      const prevBtn = document.getElementById('gallery-prev');
      const nextBtn = document.getElementById('gallery-next');
      const galleryContainer = document.getElementById('gallery-main-container');
      
      let currentIndex = 0;
      let autoplayTimer;

      // 1. Core function to switch images and update active states
      function updateGallery(index) {
        currentIndex = index;
        
        // Quick visual fade effect
        mainImg.style.opacity = 0;
        setTimeout(() => {
          mainImg.src = images[currentIndex];
          mainImg.style.opacity = 1;
        }, 150);

        // Update active thumbnail border
        thumbs.forEach(t => t.style.borderColor = 'var(--color-border)');
        thumbs[currentIndex].style.borderColor = 'var(--color-primary)';
      }

      // 2. Next / Prev Math Logic (Loops back to start/end seamlessly)
      function showNext() {
        updateGallery((currentIndex + 1) % images.length);
      }
      function showPrev() {
        updateGallery((currentIndex - 1 + images.length) % images.length);
      }

      // 3. Attach Manual Event Listeners
      nextBtn.addEventListener('click', showNext);
      prevBtn.addEventListener('click', showPrev);

      thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => updateGallery(index));
      });

      // 4. Smart Autoplay Logic (4-second interval)
      function startAutoplay() {
        autoplayTimer = setInterval(() => {
          // Memory leak prevention: Kill timer if user left the page
          if (!document.getElementById('gallery-main-container')) {
            clearInterval(autoplayTimer);
            return;
          }
          showNext();
        }, 4000);
      }

      function stopAutoplay() {
        clearInterval(autoplayTimer);
      }

      // 5. Pause on hover interactions
      galleryContainer.addEventListener('mouseenter', stopAutoplay);
      galleryContainer.addEventListener('mouseleave', startAutoplay);

      // Initialize the timer
      startAutoplay();
    }

    // --- 🛒 PART 3: STATE LOGIC (QUANTITY & WISHLIST) ---
    
    // 1. Quantity Selector Logic
    let currentQty = 1;
    const qtyDisplay = document.getElementById('qty-display');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const addToCartBtn = document.getElementById('add-to-cart-detail');

    if (qtyMinus && qtyPlus && qtyDisplay) {
      qtyMinus.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          qtyDisplay.textContent = currentQty;
        }
      });

      qtyPlus.addEventListener('click', () => {
        currentQty++;
        qtyDisplay.textContent = currentQty;
      });
    }

    // 2. Upgraded Add to Cart (Fixed UI Reset)
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        for (let i = 0; i < currentQty; i++) {
          cartStore.addToCart(product);
        }
        
        // Cache the exact original styles
        const originalText = addToCartBtn.textContent;
        const origBg = addToCartBtn.style.background;
        const origColor = addToCartBtn.style.color;
        const origBorder = addToCartBtn.style.border;

        // Apply success state
        addToCartBtn.textContent = '✓ Added';
        addToCartBtn.style.background = '#10b981';
        addToCartBtn.style.color = 'white';
        addToCartBtn.style.border = '2px solid #10b981';
        
        setTimeout(() => {
          // Safely restore the original styles
          addToCartBtn.textContent = originalText;
          addToCartBtn.style.background = origBg;
          addToCartBtn.style.color = origColor;
          addToCartBtn.style.border = origBorder;
        }, 2000);

        currentQty = 1;
        qtyDisplay.textContent = currentQty;
      });
    }

    // 3. UPGRADED: Buy Now Button Logic (Session Storage Override)
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        // Create a direct-buy package and save it temporarily
        const directItem = { ...product, quantity: currentQty };
        sessionStorage.setItem('buyNowItem', JSON.stringify(directItem));
        
        // Go straight to checkout (Bypassing the cart store)
        window.location.hash = '#/checkout';
      });
    }

    // 3. Wishlist Integration
    const wishlistBtn = document.getElementById('detail-wishlist-btn');
    if (wishlistBtn) {
      // Function to sync UI with store state
      const updateWishlistUI = () => {
        const isWished = wishlistStore.hasItem(product.id);
        wishlistBtn.textContent = isWished ? '❤️' : '🤍';
      };

      // Set initial state on load
      updateWishlistUI();

      // Listen for global wishlist updates (in case it changes elsewhere)
      window.addEventListener('wishlistUpdated', updateWishlistUI);

      // Handle user click
      wishlistBtn.addEventListener('click', async () => {
        await wishlistStore.toggle(product);
        // The global 'wishlistUpdated' event fired by the store will auto-update the UI
      });
    }

    // 4. (Keep the existing Read More toggle logic here)
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

    // 5. Title Expand/Collapse Logic
    const titleContent = document.getElementById('product-title-content');
    const toggleTitleBtn = document.getElementById('toggle-title-btn');
    
    if (titleContent && toggleTitleBtn) {
      // Use a slight timeout to ensure the DOM has painted the fonts correctly before measuring
      setTimeout(() => {
        // If the actual height is greater than the visible clamped height, it means it was truncated
        if (titleContent.scrollHeight > titleContent.clientHeight) {
          toggleTitleBtn.style.display = 'inline-block';
          
          toggleTitleBtn.addEventListener('click', () => {
            if (titleContent.style.webkitLineClamp === '2') {
              titleContent.style.webkitLineClamp = 'unset';
              toggleTitleBtn.textContent = 'Hide full name';
            } else {
              titleContent.style.webkitLineClamp = '2';
              toggleTitleBtn.textContent = 'Show full name';
            }
          });
        }
      }, 100);
    }

  } catch (error) {
    container.innerHTML = `<h2 style="color: red; text-align: center; margin-top: 2rem;">Error: ${error.message}</h2>`;
  }
}