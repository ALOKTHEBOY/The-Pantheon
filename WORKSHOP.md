# 🛠️ Workshop & Engineering Log: The Pantheon

This document tracks the major architectural decisions, bug fixes, and custom systems built during the transition from NovaCart Pro to The Pantheon.

## 1. Firebase Migration & Rebranding
*   **Project ID:** Transitioned backend to a fresh Firebase project (`the-pantheon-358ec`).
*   **Design System:** Converted UI to an "Obsidian & Gold" luxury theme. Backgrounds utilize `var(--color-surface)` and transparent glass-morphism effects.
*   **Meta Updates:** Overhauled Open Graph and Twitter meta tags in `index.html` to reflect the new brand and live URL for social sharing.

## 2. Dynamic Hero Banner Engine
*   **Problem:** The homepage banner was hardcoded, requiring manual HTML edits for every sale.
*   **Solution:** Built a dynamic Carousel Engine in `Home.js` powered by a `homepage_settings` Firestore document.
*   **Features Added:**
    *   Image URL pasting OR local file uploading.
    *   Built-in JavaScript Image Compressor (Canvas API) scaling images to a maximum 1200px width and 60% JPEG quality to bypass Firestore's 1MB document limit.
    *   Dropdown routing to standard categories or custom links (e.g., specific product IDs).
    *   Edit (`✎`) and Clear capabilities inside the `ManageHome.js` dashboard.

## 3. Firestore Security Architecture
Implemented the following rules to secure the database, ensuring only the master admin account can modify the catalog and homepage layout, while allowing users to save wishlists and orders.

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, Admin-only write
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'alokb7837@gmail.com';
    }
    match /homepage_settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'alokb7837@gmail.com';
    }
    // Authenticated user read/write
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /wishlists/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /wishlist/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## 4. Local Storage Data Wipe
*   **Issue:** The `Checkout.js` form was auto-filling old test addresses from previous iterations.
*   **Fix:** Updated the `localStorage` key from `novacart_address` to `pantheon_address` to force a clean slate for the new brand. Same logic applied to `notificationStore.js`.