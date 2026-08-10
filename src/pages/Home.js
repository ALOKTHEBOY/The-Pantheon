import { db } from '../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { ProductCard } from '../components/ProductCard.js';

export function Home() {
  return `
    <style>
      .hero-carousel {
        position: relative;
        width: 100%;
        height: 450px;
        overflow: hidden;
        border-radius: var(--radius-md);
        margin-bottom: 3rem;
        background: #111;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      }
      .carousel-slide {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        background-size: cover;
        background-position: center;
      }
      .carousel-slide.active { opacity: 1; z-index: 1; }
      .carousel-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
        z-index: 0;
      }
      .carousel-content {
        position: relative;
        z-index: 2;
        padding: 2rem;
        max-width: 800px;
        width: 100%;
      }
      .carousel-title {
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-family: 'Georgia', serif;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      }
      .carousel-subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: #e5e7eb;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      .carousel-indicators {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        z-index: 3;
      }
      .indicator-dot {
        width: 12px; height: 12px;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .indicator-dot.active {
        background: white;
        transform: scale(1.2);
      }
      
      /* New Desktop Classes for Section Headers */
      .section-header-container {
        display: flex; 
        justify-content: space-between; 
        align-items: flex-end; 
        margin-bottom: 1.5rem;
        padding-top: 2rem; 
        border-top: 1px solid var(--color-border);
      }
      .section-title {
        font-family: 'Georgia', serif; 
        text-transform: uppercase; 
        letter-spacing: 1px;
        margin: 0;
      }
      .section-link {
        color: var(--color-primary); 
        text-decoration: none; 
        font-weight: bold;
      }

      /* MOBILE SPECIFIC FIXES */
      @media (max-width: 768px) {
        .hero-carousel { height: 400px; }
        .carousel-content { padding: 1rem 1rem 3rem 1rem; } /* Pushes content up away from dots */
        .carousel-title { font-size: 1.8rem; line-height: 1.2; margin-bottom: 0.5rem; }
        .carousel-subtitle { font-size: 1rem; margin-bottom: 1.5rem; }
        
        .section-header-container {
          flex-direction: column; /* Stack the title and link */
          align-items: flex-start;
          gap: 8px;
        }
        .section-title { font-size: 1.2rem; }
        .section-link { font-size: 0.9rem; margin-bottom: 0; }
      }
    </style>

    <div style="max-width: 1200px; margin: 0 auto; padding: 1rem;">
      
      <!-- Hero Carousel Engine -->
      <div class="hero-carousel" id="home-hero-carousel"></div>

      <!-- Section 1: Trending Artifacts -->
      <div class="section-header-container">
        <h2 class="section-title">Trending in the Vault</h2>
        <a href="#/products" class="section-link">View All →</a>
      </div>
      <div id="home-trending-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; justify-content: center; margin-bottom: 3rem;">
        <p style="color: var(--color-text-muted);">Unlocking the archives...</p>
      </div>

      <!-- Section 2: Category Best (Tech) -->
      <div class="section-header-container">
        <h2 class="section-title">Advanced Technology</h2>
        <a href="#/products?category=electronics" class="section-link">Shop Tech →</a>
      </div>
      <div id="home-tech-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; justify-content: center; margin-bottom: 3rem;">
        <p style="color: var(--color-text-muted);">Decrypting tech catalog...</p>
      </div>

      <!-- Section 3: New Arrivals (Time Filtered) -->
      <div class="section-header-container">
        <h2 class="section-title">New Arrivals</h2>
        <a href="#/products?sort=new" class="section-link">View All →</a>
      </div>
      <div id="home-new-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; justify-content: center; margin-bottom: 3rem;">
        <p style="color: var(--color-text-muted);">Scanning recent acquisitions...</p>
      </div>
      
    </div>
  `;
}

export async function initHome() {
  // --- 1. CAROUSEL LOGIC ---
  const carouselContainer = document.getElementById('home-hero-carousel');
  
  const slidesData = [
    {
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      title: '50% Off Future Tech',
      subtitle: 'Upgrade your timeline with Class-4 Hyperdrive Engines and personal forcefields.',
      link: '#/products?category=electronics',
      btnText: 'Shop Tech'
    },
    {
      image: 'https://images.unsplash.com/photo-1605556209590-097fa620f4b3?q=80&w=1200&auto=format&fit=crop',
      title: '60% Off Historical Armor',
      subtitle: 'Authentic Spartan gear and medieval luxury outfits. Guaranteed battle-ready.',
      link: '#/products?category=outfits',
      btnText: 'Shop Outfits'
    },
    {
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
      title: 'Billionaire Festival Sale',
      subtitle: 'Get an extra 25% off on all private planets and decommissioned UFOs.',
      link: '#/products',
      btnText: 'Explore The Vault'
    }
  ];

  if (carouselContainer) {
    const slidesHTML = slidesData.map((slide, index) => `
      <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image}');" data-index="${index}">
        <div class="carousel-overlay"></div>
        <div class="carousel-content">
          <h2 class="carousel-title">${slide.title}</h2>
          <p class="carousel-subtitle">${slide.subtitle}</p>
          <a href="${slide.link}" class="btn" style="text-decoration: none; padding: 12px 30px; font-size: 1.1rem; border-radius: 30px; background: var(--color-primary); color: white; border: none; font-weight: bold;">${slide.btnText}</a>
        </div>
      </div>
    `).join('');

    const indicatorsHTML = `
      <div class="carousel-indicators">
        ${slidesData.map((_, index) => `<div class="indicator-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`).join('')}
      </div>
    `;

    carouselContainer.innerHTML = slidesHTML + indicatorsHTML;

    const slides = carouselContainer.querySelectorAll('.carousel-slide');
    const dots = carouselContainer.querySelectorAll('.indicator-dot');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() { goToSlide((currentSlide + 1) % slides.length); }
    function startSlider() { slideInterval = setInterval(nextSlide, 5000); }
    function stopSlider() { clearInterval(slideInterval); }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopSlider();
        goToSlide(index);
        startSlider(); 
      });
    });

    carouselContainer.addEventListener('mouseenter', stopSlider);
    carouselContainer.addEventListener('mouseleave', startSlider);
    startSlider();
    
    window.addEventListener('hashchange', () => stopSlider(), { once: true });
  }

  // --- 2. 3-TIER DATA FETCHING (WIRED TO CMS) ---
  try {
    // Fetch all products
    const productSnap = await getDocs(collection(db, 'products'));
    const allProducts = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch CMS Settings
    const { doc, getDoc } = await import('firebase/firestore'); // Ensure doc/getDoc are available
    const settingsRef = doc(db, 'homepage_settings', 'layout');
    const settingsSnap = await getDoc(settingsRef);
    const settings = settingsSnap.exists() ? settingsSnap.data() : { trending: [], tech: [], newArrivals: [] };

    // Helper function to map IDs to actual product HTML
    const renderGrid = (gridId, idArray, fallbackText) => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      
      if (!idArray || idArray.length === 0) {
        grid.innerHTML = `<p style="color: var(--color-text-muted);">${fallbackText}</p>`;
        return;
      }
      
      const items = idArray.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
      grid.innerHTML = items.length 
        ? items.map(p => ProductCard(p)).join('')
        : `<p style="color: var(--color-text-muted);">${fallbackText}</p>`;
    };

    // Render the 3 Tiers using CMS data
    renderGrid('home-trending-grid', settings.trending, 'No items configured in CMS.');
    renderGrid('home-tech-grid', settings.tech, 'No items configured in CMS.');
    renderGrid('home-new-grid', settings.newArrivals, 'No items configured in CMS.');

  } catch (error) {
    console.error(error);
    const grids = ['home-trending-grid', 'home-tech-grid', 'home-new-grid'];
    grids.forEach(id => {
      const grid = document.getElementById(id);
      if (grid) grid.innerHTML = '<p style="color: red;">Failed to load the vault contents.</p>';
    });
  }
}