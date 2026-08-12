import { db } from '../services/firebase.js';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { cartStore } from '../store/cartStore.js';
import { wishlistStore } from '../store/wishlistStore.js'; 
import { settingsStore } from '../store/settingsStore.js';
import { authStore } from '../store/authStore.js';
import { showToast } from '../utils/toast.js';

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
    
    const images = product.images && product.images.length > 0 
      ? product.images 
      : [product.image || 'https://via.placeholder.com/400'];

    container.innerHTML = `
      <!-- Top Navigation & Share Button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <a href="#/products" style="color: var(--color-text-muted); text-decoration: none; font-weight: bold;">← Back to Catalog</a>
        <button id="detail-share-btn" style="background: var(--color-surface); color: var(--color-text-main); border: 1px solid var(--color-border); padding: 6px 16px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: bold; transition: background 0.2s;">
          🔗 Share Artifact
        </button>
      </div>
      
      <!-- Prominent Title Section -->
      <div style="margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;">
        <div style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1px; margin-bottom: 5px;">
          ${product.category || 'Other'}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <h1 id="product-title-content" title="${product.name}" style="font-size: clamp(1.8rem, 5vw, 2.5rem); margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease;">
            ${product.name}
          </h1>
          <button id="toggle-title-btn" style="background: none; border: none; color: var(--color-primary); cursor: pointer; padding: 6px 0 0 0; font-size: 0.85rem; font-weight: bold; display: none;">Show full name</button>
        </div>
      </div>

      <div class="product-details-grid">
        
        <!-- Left: Image Gallery with ZOOM -->
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <div class="gallery-container" id="gallery-main-container" style="position: relative; overflow: hidden; border-radius: var(--radius-md); background: var(--color-surface); height: 500px; display: flex; align-items: center; justify-content: center;">
            ${hasDiscount ? `<div style="position: absolute; top: 20px; left: 20px; background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 1rem; z-index: 10;">🔥 ${product.discountPercentage}% OFF</div>` : ''}
            
            <!-- Wishlist Button (Alone over image) -->
            <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
              <button id="detail-wishlist-btn" style="background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 45px; height: 45px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 1.4rem; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">🤍</button>
            </div>

            ${images.length > 1 ? `
              <button class="gallery-nav-btn gallery-prev" id="gallery-prev" style="z-index: 10;">❮</button>
              <button class="gallery-nav-btn gallery-next" id="gallery-next" style="z-index: 10;">❯</button>
            ` : ''}
            
            <div id="image-zoom-wrapper" style="width: 100%; height: 100%; cursor: zoom-in; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <img id="main-product-image" src="${images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.1s ease-out, opacity 0.2s ease-in-out;">
            </div>
          </div>
          
          ${images.length > 1 ? `
            <div id="gallery-thumbnails" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
              ${images.map((imgUrl, index) => `
                <img class="gallery-thumb" src="${imgUrl}" data-index="${index}" style="flex-shrink: 0; width: 70px; height: 70px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${index === 0 ? 'var(--color-primary)' : 'var(--color-border)'}; transition: border-color 0.2s;">
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Right: Details -->
        <div style="min-width: 0;">
          
          <div style="display: flex; gap: 15px; margin-bottom: 1.5rem; font-size: 0.85rem; color: #10b981; font-weight: bold; flex-wrap: wrap;">
            <span>✓ Quality Assured</span>
            <span>✓ Secure Checkout</span>
          </div>
          
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

          ${product.highlights && product.highlights.length > 0 ? `
            <div style="margin-bottom: 2rem;">
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Key Highlights</h3>
              <ul style="margin: 0; padding-left: 20px; color: var(--color-text-main); line-height: 1.6;">
                ${product.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- RESTORED: Expandable About Text -->
          <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 10px; font-size: 1.2rem;">About this item</h3>
            <div style="color: var(--color-text-main); line-height: 1.6; text-align: left; padding-bottom: 15px;">
              <p id="about-text-content" style="margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; transition: all 0.3s ease;">
                ${aboutText}
              </p>
              <button id="read-more-btn" style="background: none; border: none; color: var(--color-primary); cursor: pointer; padding: 6px 0 0 0; font-weight: bold; display: none;">Read More</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Comments & Reviews Section -->
      <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
        <h2 style="margin-bottom: 1.5rem; font-family: 'Georgia', serif;">Client Testimonials</h2>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
          
          <!-- Add Review Form -->
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Submit an Assessment</h3>
            <form id="add-review-form" style="display: flex; flex-direction: column; gap: 15px;">
              <textarea id="review-text" required rows="3" placeholder="Detail your experience with this artifact..." style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); font-family: inherit;"></textarea>
              <button type="submit" class="btn" style="align-self: flex-start;">Publish Review</button>
            </form>
            <p id="review-auth-warning" style="display: none; color: #ef4444; font-size: 0.85rem; margin-top: 10px;">You must be logged in to leave a review.</p>
          </div>

          <!-- Reviews List -->
          <div id="reviews-list-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <p style="color: var(--color-text-muted);">Scanning the ledger for reviews...</p>
          </div>

        </div>
      </div>
    `;

    // --- 📌 UI RESTORATION: TITLE & DESC EXPANDERS ---
    const titleContent = document.getElementById('product-title-content');
    const toggleTitleBtn = document.getElementById('toggle-title-btn');
    if (titleContent && toggleTitleBtn) {
      setTimeout(() => {
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

    const readMoreBtn = document.getElementById('read-more-btn');
    const aboutContent = document.getElementById('about-text-content');
    if (readMoreBtn && aboutContent) {
      setTimeout(() => {
        if (aboutContent.scrollHeight > aboutContent.clientHeight) {
          readMoreBtn.style.display = 'inline-block';
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
      }, 100);
    }

    // --- 🔊 WISHLIST SOUND & LOGIC ---
    const wishlistBtn = document.getElementById('detail-wishlist-btn');
    if (wishlistBtn) {
      const updateWishlistUI = () => {
        const isWished = wishlistStore.hasItem(product.id);
        wishlistBtn.textContent = isWished ? '❤️' : '🤍';
        wishlistBtn.style.transform = isWished ? 'scale(1.1)' : 'scale(1)';
      };

      updateWishlistUI();
      window.addEventListener('wishlistUpdated', updateWishlistUI);

      wishlistBtn.addEventListener('click', async () => {
        settingsStore.playSound('notify'); 
        await wishlistStore.toggle(product);
        const isNowWished = wishlistStore.hasItem(product.id);
        showToast(isNowWished ? 'Added to Wishlist!' : 'Removed from Wishlist');
      });
    }

    // --- 🔗 SHARE LOGIC ---
    const shareBtn = document.getElementById('detail-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const shareData = { title: product.name, text: `Check out ${product.name} on The Pantheon!`, url: window.location.href };
        if (navigator.share) {
          try { await navigator.share(shareData); } catch (err) { console.log('Share cancelled.'); }
        } else {
          navigator.clipboard.writeText(window.location.href);
          showToast('Link copied to clipboard!');
        }
      });
    }

    // --- 🔍 FEATURE: IMAGE MAGNIFIER (ZOOM) ---
    const zoomWrapper = document.getElementById('image-zoom-wrapper');
    const mainImg = document.getElementById('main-product-image');
    
    if (zoomWrapper && mainImg) {
      zoomWrapper.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = zoomWrapper.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        mainImg.style.transform = 'scale(2.5)'; 
      });
      zoomWrapper.addEventListener('mouseleave', () => {
        mainImg.style.transformOrigin = 'center center';
        mainImg.style.transform = 'scale(1)';
      });
    }

    // --- 🖼️ EXISTING: GALLERY LOGIC ---
    if (images.length > 1) {
      const thumbs = document.querySelectorAll('.gallery-thumb');
      const prevBtn = document.getElementById('gallery-prev');
      const nextBtn = document.getElementById('gallery-next');
      let currentIndex = 0;

      function updateGallery(index) {
        currentIndex = index;
        mainImg.style.opacity = 0;
        setTimeout(() => {
          mainImg.src = images[currentIndex];
          mainImg.style.opacity = 1;
        }, 100);
        thumbs.forEach(t => t.style.borderColor = 'var(--color-border)');
        thumbs[currentIndex].style.borderColor = 'var(--color-primary)';
      }

      if (nextBtn) nextBtn.addEventListener('click', () => updateGallery((currentIndex + 1) % images.length));
      if (prevBtn) prevBtn.addEventListener('click', () => updateGallery((currentIndex - 1 + images.length) % images.length));
      thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => updateGallery(index)));
    }

    // --- 🛒 EXISTING: CART LOGIC ---
    let currentQty = 1;
    const qtyDisplay = document.getElementById('qty-display');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const addToCartBtn = document.getElementById('add-to-cart-detail');
    const buyNowBtn = document.getElementById('buy-now-btn');

    if (qtyMinus && qtyPlus && qtyDisplay) {
      qtyMinus.addEventListener('click', () => { if (currentQty > 1) qtyDisplay.textContent = --currentQty; });
      qtyPlus.addEventListener('click', () => qtyDisplay.textContent = ++currentQty);
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        settingsStore.playSound('cart'); 
        for (let i = 0; i < currentQty; i++) cartStore.addToCart(product);
        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = '✓ Added';
        addToCartBtn.style.background = '#10b981';
        addToCartBtn.style.color = 'white';
        addToCartBtn.style.border = '2px solid #10b981';
        setTimeout(() => {
          addToCartBtn.textContent = originalText;
          addToCartBtn.style.background = 'var(--color-surface)';
          addToCartBtn.style.color = 'var(--color-primary)';
          addToCartBtn.style.border = '2px solid var(--color-primary)';
        }, 2000);
        currentQty = 1;
        qtyDisplay.textContent = currentQty;
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        settingsStore.playSound('buy'); 
        sessionStorage.setItem('buyNowItem', JSON.stringify({ ...product, quantity: currentQty }));
        window.location.hash = '#/checkout';
      });
    }

    // --- 📝 UPGRADED: REVIEWS & COMMENTS LOGIC ---
    const reviewsContainer = document.getElementById('reviews-list-container');
    const reviewForm = document.getElementById('add-review-form');
    const authWarning = document.getElementById('review-auth-warning');

    function generateDP(name, photoUrl, size = '40px') {
      if (photoUrl) {
        return `<img src="${photoUrl}" style="width: ${size}; height: ${size}; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-border); flex-shrink: 0;">`;
      }
      const initial = name ? name.charAt(0).toUpperCase() : 'U';
      return `<div style="width: ${size}; height: ${size}; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: calc(${size} * 0.4); flex-shrink: 0; border: 1px solid var(--color-border);">${initial}</div>`;
    }

    async function loadReviews() {
      try {
        const q = query(collection(db, 'product_reviews'), where('productId', '==', productId));
        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (reviews.length === 0) {
          reviewsContainer.innerHTML = '<p style="color: var(--color-text-muted); font-style: italic;">No assessments have been recorded yet. Be the first to share your thoughts.</p>';
          return;
        }

        const currentUserId = authStore.user ? authStore.user.uid : null;
        const adminEmail = 'alokb7837@gmail.com';
        const isAdmin = authStore.user && authStore.user.email === adminEmail;

        reviewsContainer.innerHTML = reviews.map(r => {
          const likes = r.likes || [];
          const dislikes = r.dislikes || [];
          const comments = r.comments || [];
          const hasLiked = currentUserId && likes.includes(currentUserId);
          const hasDisliked = currentUserId && dislikes.includes(currentUserId);
          const isReviewOwner = currentUserId === r.userId;
          const canManageReview = isReviewOwner || isAdmin;

          return `
          <div style="padding: 1.5rem; background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; position: relative;">
              <div style="display: flex; gap: 12px; align-items: center;">
                ${generateDP(r.authorName, r.authorPhoto)}
                <div>
                  <div style="font-weight: bold; color: var(--color-text-main); font-size: 1.05rem;">${r.authorName}</div>
                  <div style="color: var(--color-text-muted); font-size: 0.75rem;">${new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <!-- Review Options Menu -->
              ${canManageReview ? `
                <div>
                  <button class="options-toggle-btn" data-id="${r.id}" style="background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--color-text-muted); padding: 0 5px;">⋮</button>
                  <div id="options-menu-${r.id}" class="review-options-menu" style="display: none; position: absolute; right: 0; top: 100%; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20; min-width: 120px; overflow: hidden;">
                    ${isReviewOwner ? `<button class="edit-review-btn" data-id="${r.id}" style="display: block; width: 100%; text-align: left; padding: 10px 15px; background: none; border: none; border-bottom: 1px solid var(--color-border); cursor: pointer; font-size: 0.85rem; color: var(--color-text-main);">✎ Edit</button>` : ''}
                    <button class="delete-review-btn" data-id="${r.id}" style="display: block; width: 100%; text-align: left; padding: 10px 15px; background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #ef4444;">🗑️ Delete</button>
                  </div>
                </div>
              ` : ''}
            </div>
            
            <!-- REVIEW BODY -->
            <div id="review-content-wrapper-${r.id}">
              <p id="review-desc-${r.id}" class="review-body-text" data-id="${r.id}" title="Click to view comments" style="margin: 0 0 1rem 0; color: var(--color-text-main); line-height: 1.6; font-size: 0.95rem; cursor: pointer;">${r.text}</p>
              
              <!-- INLINE EDIT FORM -->
              <form id="edit-form-${r.id}" class="edit-review-form" data-id="${r.id}" style="display: none; flex-direction: column; gap: 10px; margin-bottom: 1rem;">
                <textarea id="edit-textarea-${r.id}" required rows="3" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--color-primary); background: var(--color-background); color: var(--color-text-main); font-family: inherit; font-size: 0.95rem;">${r.text}</textarea>
                <div style="display: flex; gap: 10px;">
                  <button type="submit" class="btn" style="padding: 6px 16px; font-size: 0.85rem; border-radius: 20px; flex-shrink: 0; width: auto;">Save Update</button>
                  <button type="button" class="cancel-edit-btn" data-id="${r.id}" style="background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.85rem;">Cancel</button>
                </div>
              </form>
            </div>
            
            <div style="display: flex; gap: 1.5rem; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 12px;">
              <button class="action-btn like-review-btn" data-id="${r.id}" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.95rem; color: ${hasLiked ? 'var(--color-primary)' : 'var(--color-text-muted)'}; font-weight: ${hasLiked ? 'bold' : 'normal'}; transition: color 0.2s;">
                <span style="font-size: 1.2rem;">👍</span> ${likes.length}
              </button>
              <button class="action-btn dislike-review-btn" data-id="${r.id}" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.95rem; color: ${hasDisliked ? '#ef4444' : 'var(--color-text-muted)'}; font-weight: ${hasDisliked ? 'bold' : 'normal'}; transition: color 0.2s;">
                <span style="font-size: 1.2rem;">👎</span> ${dislikes.length}
              </button>
              <button class="action-btn toggle-comments-btn" data-id="${r.id}" title="View comments" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.95rem; color: var(--color-text-muted); transition: color 0.2s;">
                <span style="font-size: 1.2rem;">💬</span> ${comments.length}
              </button>
            </div>

            <!-- COMMENTS SECTION -->
            <div id="comments-section-${r.id}" style="display: none; margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--color-border); flex-direction: column; gap: 1rem;">
              
              <!-- Existing Comments with Edit/Delete capabilities -->
              ${comments.map(c => {
                const isCommentOwner = currentUserId === c.userId;
                const canManageComment = isCommentOwner || isAdmin;
                const cId = c.commentId || new Date(c.createdAt).getTime().toString();

                return `
                  <div style="display: flex; gap: 10px; position: relative;">
                    ${generateDP(c.authorName, c.authorPhoto, '28px')}
                    <div style="background: var(--color-surface); padding: 10px 14px; border-radius: 0 12px 12px 12px; border: 1px solid var(--color-border); flex: 1;">
                      
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="font-size: 0.85rem; color: var(--color-text-main);">${c.authorName}</strong>
                        
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <small style="color: var(--color-text-muted); font-size: 0.7rem;">${new Date(c.createdAt).toLocaleDateString()}</small>
                          
                          <!-- Comment Options Menu -->
                          ${canManageComment ? `
                            <div style="position: relative;">
                              <button class="comment-options-toggle-btn" data-cid="${cId}" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: var(--color-text-muted); padding: 0 4px; line-height: 1;">⋮</button>
                              <div id="comment-options-menu-${cId}" class="review-options-menu" style="display: none; position: absolute; right: 0; top: 100%; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20; min-width: 100px; overflow: hidden;">
                                ${isCommentOwner ? `<button class="edit-comment-btn" data-revid="${r.id}" data-cid="${cId}" style="display: block; width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; border-bottom: 1px solid var(--color-border); cursor: pointer; font-size: 0.8rem; color: var(--color-text-main);">✎ Edit</button>` : ''}
                                <button class="delete-comment-btn" data-revid="${r.id}" data-cid="${cId}" style="display: block; width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; cursor: pointer; font-size: 0.8rem; color: #ef4444;">🗑️ Delete</button>
                              </div>
                            </div>
                          ` : ''}
                        </div>
                      </div>
                      
                      <!-- COMMENT BODY -->
                      <div id="comment-content-wrapper-${cId}">
                        <p id="comment-desc-${cId}" style="margin: 0; font-size: 0.85rem; color: var(--color-text-main); line-height: 1.4;">${c.text}</p>
                        
                        <!-- INLINE EDIT FORM FOR COMMENT -->
                        <form id="edit-comment-form-${cId}" class="edit-comment-form" data-revid="${r.id}" data-cid="${cId}" style="display: none; flex-direction: column; gap: 8px; margin-top: 6px;">
                          <textarea id="edit-comment-textarea-${cId}" required rows="2" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-primary); background: var(--color-background); color: var(--color-text-main); font-family: inherit; font-size: 0.85rem;">${c.text}</textarea>
                          <div style="display: flex; gap: 8px;">
                            <button type="submit" class="btn" style="padding: 4px 12px; font-size: 0.8rem; border-radius: 20px; width: auto; flex-shrink: 0;">Save</button>
                            <button type="button" class="cancel-edit-comment-btn" data-cid="${cId}" style="background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 0.8rem;">Cancel</button>
                          </div>
                        </form>
                      </div>

                    </div>
                  </div>
                `;
              }).join('')}

              <!-- REPLY FORM -->
              <form class="add-comment-form" id="comment-form-${r.id}" data-id="${r.id}" style="margin-top: 5px; display: flex; gap: 10px; align-items: center;">
                ${currentUserId ? generateDP(authStore.user.displayName, authStore.user.photoURL, '30px') : ''}
                <input type="text" required placeholder="Write a reply..." style="flex: 1; min-width: 0; padding: 10px 16px; border-radius: 20px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-main); font-size: 0.9rem; outline: none; transition: border-color 0.2s;">
                <button type="submit" style="background: var(--color-primary); color: white; border: none; border-radius: 20px; padding: 8px 24px; font-size: 0.85rem; cursor: pointer; width: auto; font-weight: bold; flex-shrink: 0;">Post</button>
              </form>
            </div>

          </div>
        `}).join('');
      } catch (error) {
        reviewsContainer.innerHTML = '<p style="color: #ef4444;">Failed to load reviews.</p>';
      }
    }

    await loadReviews();

    // Event Delegation for Reviews and Comments
    reviewsContainer.onclick = async (e) => {
      const currentUserId = authStore.user ? authStore.user.uid : null;
      
      // Close all options menus if clicking outside
      if (!e.target.closest('.options-toggle-btn') && !e.target.closest('.comment-options-toggle-btn')) {
        document.querySelectorAll('.review-options-menu').forEach(m => m.style.display = 'none');
      }

      // --- MAIN REVIEW OPTIONS ---
      const optionsToggleBtn = e.target.closest('.options-toggle-btn');
      if (optionsToggleBtn) {
        const revId = optionsToggleBtn.getAttribute('data-id');
        const menu = document.getElementById(`options-menu-${revId}`);
        document.querySelectorAll('.review-options-menu').forEach(m => { if(m !== menu) m.style.display = 'none'; });
        if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        return;
      }

      const deleteBtn = e.target.closest('.delete-review-btn');
      if (deleteBtn) {
        if(confirm("Are you sure you want to delete this assessment?")) {
          const revId = deleteBtn.getAttribute('data-id');
          await deleteDoc(doc(db, 'product_reviews', revId));
          showToast("Assessment removed.");
          await loadReviews();
        }
        return;
      }

      const editBtn = e.target.closest('.edit-review-btn');
      if (editBtn) {
        const revId = editBtn.getAttribute('data-id');
        document.getElementById(`review-desc-${revId}`).style.display = 'none';
        document.getElementById(`edit-form-${revId}`).style.display = 'flex';
        document.getElementById(`options-menu-${revId}`).style.display = 'none';
        return;
      }

      const cancelEditBtn = e.target.closest('.cancel-edit-btn');
      if (cancelEditBtn) {
        const revId = cancelEditBtn.getAttribute('data-id');
        document.getElementById(`review-desc-${revId}`).style.display = 'block';
        document.getElementById(`edit-form-${revId}`).style.display = 'none';
        return;
      }

      // --- NESTED COMMENT OPTIONS ---
      const commentOptionsToggleBtn = e.target.closest('.comment-options-toggle-btn');
      if (commentOptionsToggleBtn) {
        const cId = commentOptionsToggleBtn.getAttribute('data-cid');
        const menu = document.getElementById(`comment-options-menu-${cId}`);
        document.querySelectorAll('.review-options-menu').forEach(m => { if(m !== menu) m.style.display = 'none'; });
        if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        return;
      }

      const deleteCommentBtn = e.target.closest('.delete-comment-btn');
      if (deleteCommentBtn) {
        if(confirm("Are you sure you want to delete this comment?")) {
          const revId = deleteCommentBtn.getAttribute('data-revid');
          const cId = deleteCommentBtn.getAttribute('data-cid');
          const ref = doc(db, 'product_reviews', revId);
          
          try {
            const docSnap = await getDoc(ref);
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Filter out the comment we want to delete
              const updatedComments = data.comments.filter(c => (c.commentId || new Date(c.createdAt).getTime().toString()) != cId);
              await updateDoc(ref, { comments: updatedComments });
              showToast("Comment removed.");
              await loadReviews();
              // Re-open comments section
              const commentsSection = document.getElementById(`comments-section-${revId}`);
              if (commentsSection) commentsSection.style.display = 'flex';
            }
          } catch(err) {
            showToast("Failed to delete comment.", "error");
          }
        }
        return;
      }

      const editCommentBtn = e.target.closest('.edit-comment-btn');
      if (editCommentBtn) {
        const cId = editCommentBtn.getAttribute('data-cid');
        document.getElementById(`comment-desc-${cId}`).style.display = 'none';
        document.getElementById(`edit-comment-form-${cId}`).style.display = 'flex';
        document.getElementById(`comment-options-menu-${cId}`).style.display = 'none';
        return;
      }

      const cancelEditCommentBtn = e.target.closest('.cancel-edit-comment-btn');
      if (cancelEditCommentBtn) {
        const cId = cancelEditCommentBtn.getAttribute('data-cid');
        document.getElementById(`comment-desc-${cId}`).style.display = 'block';
        document.getElementById(`edit-comment-form-${cId}`).style.display = 'none';
        return;
      }

      // --- LIKES & DISLIKES ---
      const likeBtn = e.target.closest('.like-review-btn');
      if (likeBtn) {
        if (!currentUserId) return showToast("Please log in to vote.", "error");
        const revId = likeBtn.getAttribute('data-id');
        const ref = doc(db, 'product_reviews', revId);
        if (likeBtn.style.color.includes('var(--color-primary)')) {
          await updateDoc(ref, { likes: arrayRemove(currentUserId) });
        } else {
          await updateDoc(ref, { likes: arrayUnion(currentUserId), dislikes: arrayRemove(currentUserId) });
        }
        await loadReviews();
      }

      const dislikeBtn = e.target.closest('.dislike-review-btn');
      if (dislikeBtn) {
        if (!currentUserId) return showToast("Please log in to vote.", "error");
        const revId = dislikeBtn.getAttribute('data-id');
        const ref = doc(db, 'product_reviews', revId);
        if (dislikeBtn.style.color.includes('ef4444')) {
          await updateDoc(ref, { dislikes: arrayRemove(currentUserId) });
        } else {
          await updateDoc(ref, { dislikes: arrayUnion(currentUserId), likes: arrayRemove(currentUserId) });
        }
        await loadReviews();
      }

      // --- TOGGLE COMMENTS VISIBILITY ---
      const toggleCommentsBtn = e.target.closest('.toggle-comments-btn');
      const reviewBodyText = e.target.closest('.review-body-text');
      
      if (toggleCommentsBtn || reviewBodyText) {
        const revId = toggleCommentsBtn ? toggleCommentsBtn.getAttribute('data-id') : reviewBodyText.getAttribute('data-id');
        const commentsSection = document.getElementById(`comments-section-${revId}`);
        if (commentsSection) {
          if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'flex';
            const replyInput = document.querySelector(`#comment-form-${revId} input`);
            if (replyInput) replyInput.focus();
          } else {
            commentsSection.style.display = 'none';
          }
        }
        return;
      }
    };

    // Handle Inline Edit Submissions (Reviews & Comments)
    reviewsContainer.addEventListener('submit', async (e) => {
      
      // Submit Edited Main Review
      if (e.target.matches('.edit-review-form')) {
        e.preventDefault();
        const form = e.target;
        const revId = form.getAttribute('data-id');
        const textarea = document.getElementById(`edit-textarea-${revId}`);
        const newText = textarea.value.trim();
        const btn = form.querySelector('button[type="submit"]');
        const origBtnText = btn.textContent;

        if (!newText) return showToast("Assessment cannot be empty.", "error");

        try {
          btn.textContent = 'Saving...';
          btn.disabled = true;
          await updateDoc(doc(db, 'product_reviews', revId), { text: newText });
          showToast("Assessment updated.");
          await loadReviews();
        } catch (error) {
          showToast("Error updating assessment.", "error");
          btn.textContent = origBtnText;
          btn.disabled = false;
        }
      }

      // Submit Edited Nested Comment
      if (e.target.matches('.edit-comment-form')) {
        e.preventDefault();
        const form = e.target;
        const revId = form.getAttribute('data-revid');
        const cId = form.getAttribute('data-cid');
        const textarea = document.getElementById(`edit-comment-textarea-${cId}`);
        const newText = textarea.value.trim();
        const btn = form.querySelector('button[type="submit"]');

        if (!newText) return showToast("Comment cannot be empty.", "error");

        try {
          btn.textContent = 'Saving...';
          btn.disabled = true;
          
          const ref = doc(db, 'product_reviews', revId);
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Map through comments and replace the text of the edited one
            const updatedComments = data.comments.map(c => {
              const currentCId = c.commentId || new Date(c.createdAt).getTime().toString();
              if (currentCId == cId) {
                return { ...c, text: newText };
              }
              return c;
            });
            
            await updateDoc(ref, { comments: updatedComments });
            showToast("Comment updated.");
            await loadReviews();
            // Re-open comments section
            const commentsSection = document.getElementById(`comments-section-${revId}`);
            if (commentsSection) commentsSection.style.display = 'flex';
          }
        } catch (error) {
          showToast("Error updating comment.", "error");
          btn.textContent = 'Save';
          btn.disabled = false;
        }
      }
    });

    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!authStore.user) {
          authWarning.style.display = 'block';
          return;
        }

        const btn = reviewForm.querySelector('button');
        const originalBtnText = btn.textContent;
        const textInput = document.getElementById('review-text');

        try {
          btn.textContent = 'Publishing...';
          btn.disabled = true;
          authWarning.style.display = 'none';

          await addDoc(collection(db, 'product_reviews'), {
            productId: productId,
            userId: authStore.user.uid,
            authorName: authStore.user.displayName || 'Anonymous Explorer',
            authorPhoto: authStore.user.photoURL || null, 
            text: textInput.value.trim(),
            createdAt: new Date().toISOString(),
            likes: [],
            dislikes: [],
            comments: []
          });

          textInput.value = '';
          showToast('Review published successfully!');
          await loadReviews();
        } catch (error) {
          showToast('Error publishing review.', 'error');
        } finally {
          btn.textContent = originalBtnText;
          btn.disabled = false;
        }
      });
    }

    reviewsContainer.addEventListener('submit', async (e) => {
      // Submit New Nested Comment
      if (e.target.matches('.add-comment-form')) {
        e.preventDefault();
        if (!authStore.user) return showToast("Please log in to reply.", "error");

        const form = e.target;
        const revId = form.getAttribute('data-id');
        const textInput = form.querySelector('input');
        const btn = form.querySelector('button');
        const originalBtnText = btn.textContent;

        try {
          btn.textContent = '...';
          btn.disabled = true;

          const newComment = {
            commentId: Date.now().toString(), // Adds unique ID for easy editing later
            userId: authStore.user.uid,
            authorName: authStore.user.displayName || 'Anonymous',
            authorPhoto: authStore.user.photoURL || null,
            text: textInput.value.trim(),
            createdAt: new Date().toISOString()
          };

          await updateDoc(doc(db, 'product_reviews', revId), {
            comments: arrayUnion(newComment)
          });

          showToast("Reply posted!");
          await loadReviews();
          
          const commentsSection = document.getElementById(`comments-section-${revId}`);
          if (commentsSection) commentsSection.style.display = 'flex';

        } catch (error) {
          showToast("Error posting reply.", "error");
          btn.textContent = originalBtnText;
          btn.disabled = false;
        }
      }
    });

  } catch (error) {
    container.innerHTML = `<h2 style="color: #ef4444; text-align: center; margin-top: 2rem;">Error: ${error.message}</h2>`;
  }
}