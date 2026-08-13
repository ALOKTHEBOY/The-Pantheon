# 🛠️ Workshop & Engineering Log: The Pantheon

This document tracks the major architectural decisions, bug fixes, and custom systems built during the creation of The Pantheon.

## 1. Firebase Security & Authorization Upgrade
*   **The Problem:** Admin privileges were previously handled strictly on the client side via UI hiding, leaving the database vulnerable to direct manipulation.
*   **The Fix:** Wrote strict Firebase Firestore Rules establishing a Master Admin email. Implemented rules requiring `request.auth.uid == resource.data.userId` for customer operations, securing order histories, wishlists, and review deletion.

## 2. Real-Time Cloud Notifications
*   **The Problem ("Browser Memory Trap"):** Notifications were previously stored in `localStorage`, meaning alerts were tied to the physical browser rather than the authenticated user.
*   **The Fix:** Engineered a cloud-based notification store. Admin order status updates now write directly to a `notifications` Firestore collection attached to a specific `userId`. The frontend listens via `onSnapshot` to render targeted alerts instantly across devices.

## 3. Advanced Mobile QA & CSS Grid Refactoring
*   **The Problem:** Static desktop layouts caused severe flex-container collisions, text overflow, and horizontal scrolling on mobile viewports (specifically in the Dashboard tables).
*   **The Fix:** Refactored rigid flex rows into responsive grids using `repeat(auto-fit, minmax())`. Implemented `clamp()` for dynamic font scaling and utilized CSS `@media` queries to intelligently hide/stack table headers on screens under 650px.

## 4. Analytics Data Aggregation
*   Built a custom Vanilla JS reduction script in `Analytics.js`. It fetches all global orders, iterates through nested product arrays, and builds a real-time `Map` tracking total units sold, generated revenue, and unique buyers (using `Set()` to prevent duplicates), rendered into an expandable accordion UI.

## 5. Dynamic Hero Banner & Cinematic Zoom
*   **Image Compression:** Built a native JavaScript Canvas Image Compressor to shrink banner uploads to a max 1200px width at 60% quality, preventing Firestore 1MB document limit crashes.
*   **Magnifier:** Engineered a custom Javascript zoom engine mapping `e.clientX/Y` coordinates to `transform-origin` for high-end artifact inspection.