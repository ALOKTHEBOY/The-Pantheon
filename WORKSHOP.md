# 🛠️ Workshop & Engineering Log: The Pantheon

This document tracks the major architectural decisions, bug fixes, and custom systems built during the creation of The Pantheon.

## 1. Firebase Migration & Rebranding
*   **Project ID:** Transitioned backend to a fresh Firebase project (`the-pantheon-358ec`).
*   **Complete Purge:** Removed all legacy `novacart` references from `package.json`, local storage keys (`pantheon_items`, `pantheon_address`), and UI components.
*   **Meta Updates:** Overhauled Open Graph and Twitter meta tags in `index.html` to reflect the new brand, including rich `og:image` tags for social sharing.

## 2. Interactive Community Engine (Reviews & Comments)
*   **Schema Update:** Upgraded Firestore to handle nested arrays for `likes`, `dislikes`, and `comments` inside the `product_reviews` collection.
*   **Smart DP Generator:** Engineered a fallback avatar system that checks Firebase Auth for a Google Photo URL; if null, it mathematically generates a colored circular avatar using the user's initial.
*   **Inline Editing:** Replaced basic prompts with a DOM-manipulated inline edit form for both main reviews and nested comments.
*   **Role-Based Moderation:** Built a `window.onclick` delegation system that verifies `currentUserId` against `r.userId` and the Master Admin email to selectively render Edit/Delete dropdowns (`⋮`).

## 3. Dynamic Hero Banner Engine
*   **Features Added:**
    *   Image URL pasting OR local file uploading.
    *   Built-in JavaScript Image Compressor (Canvas API) scaling images to a maximum 1200px width and 60% JPEG quality to bypass Firestore's 1MB document limit.
    *   Dropdown routing to standard categories or custom links (e.g., specific product IDs).

## 4. Cinematic Image Zoom
*   Built a custom Vanilla JS magnification engine. It tracks mouse coordinates (`e.clientX`, `e.clientY`), calculates bounding box offsets, and dynamically applies a 250% `transform: scale()` with a mapped `transform-origin` for high-end artifact inspection.