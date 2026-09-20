# 🛠️ Workshop & Engineering Log: The Pantheon

This document tracks the major architectural decisions, bug fixes, custom systems, and sprint progressions built during the creation and evolution of The Pantheon.

---

## 1. Firebase Security & Authorization Upgrade
*   **The Problem:** Admin privileges were previously handled strictly on the client side via UI hiding, leaving the database vulnerable to direct manipulation.
*   **The Fix:** Wrote strict Firebase Firestore Rules establishing a Master Admin email (`alokb7837@gmail.com`). Implemented rules requiring `request.auth.uid == resource.data.userId` for customer operations, securing order histories, wishlists, and review deletion.

---

## 2. Real-Time Cloud Notifications
*   **The Problem ("Browser Memory Trap"):** Notifications were previously stored in `localStorage`, meaning alerts were tied to the physical browser rather than the authenticated user.
*   **The Fix:** Engineered a cloud-based notification store. Admin order status updates and server fulfillment events write directly to a `notifications` Firestore collection attached to a specific `userId`. The frontend listens via `onSnapshot` to render targeted alerts instantly across devices.

---

## 3. Advanced Mobile QA & CSS Grid Refactoring
*   **The Problem:** Static desktop layouts caused severe flex-container collisions, text overflow, and horizontal scrolling on mobile viewports (specifically in the Dashboard tables).
*   **The Fix:** Refactored rigid flex rows into responsive grids using `repeat(auto-fit, minmax())`. Implemented `clamp()` for dynamic font scaling and utilized CSS `@media` queries to intelligently hide/stack table headers on screens under 650px.

---

## 4. Analytics Data Aggregation
*   Built a custom Vanilla JS reduction script in `Analytics.js`. It fetches all global orders, iterates through nested product arrays, and builds a real-time `Map` tracking total units sold, generated revenue, and unique buyers (using `Set()` to prevent duplicates), rendered into an expandable accordion UI.

---

## 5. Dynamic Hero Banner & Cinematic Zoom
*   **Image Compression:** Built a native JavaScript Canvas Image Compressor to shrink banner uploads to a max 1200px width at 60% quality, preventing Firestore 1MB document limit crashes.
*   **Magnifier:** Engineered a custom Javascript zoom engine mapping `e.clientX/Y` coordinates to `transform-origin` for high-end artifact inspection.

---

## 6. V2: Payment Architecture & Webhook Fulfillment Upgrade

### Architectural Directives
*   **No Frontend Order Creation:** `Checkout.js` must never call `addDoc` on the `orders` collection for paid purchases.
*   **Secrets Management:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` exist only in `functions/.env` (local) or Firebase Secret Manager (production). Never expose secret credentials to the browser or commit them to version control.
*   **Price Authority:** The frontend `cartStore` calculates prices for UI display only. The backend re-calculates all totals from Firestore product documents during `prepareCheckout`.

### Database Schema (`orders`)
*   **Document ID:** `payment_intent.id` (Guarantees atomic idempotency on webhook retries)
*   `userId`: Customer's verified Firebase UID
*   `email`: Customer's verified email
*   `items`: Array of ordered products with authoritative prices
*   `totalAmount`: Server-calculated total (in ₹ INR)
*   `subtotal`: Calculated subtotal
*   `shippingDetails`: Full address, phone, and name object
*   `status`: `'paid'`
*   `paymentStatus`: `'paid'`
*   `paymentProvider`: `'stripe_test'`
*   `paymentIntentId`: Stripe PaymentIntent ID string
*   `createdAt`: ISO string timestamp
*   `paidAt`: Server Timestamp

### Sprint Progression Log
1. **Sprint 1 — Architecture Audit:** Identified security vulnerability where browser code dictated order amounts and directly created `paid` records in Firestore.
2. **Sprint 2 — The Trusted Boundary:** Introduced Firebase Cloud Functions v2. Built the `prepareCheckout` callable endpoint to authenticate tokens and calculate true totals from Firestore.
3. **Sprint 3 — Stripe Test Integration:** Added Stripe Node.js SDK to the Cloud Function, generating test `PaymentIntent`s and mounting Stripe Elements in the frontend.
4. **Sprint 4 — Secure Fulfillment (Webhook):** Shifted order creation exclusively to a `stripeWebhook` HTTP endpoint. Added cryptographic signature verification (`whsec_...`) and idempotency deduplication.
5. **Sprint 5 — UX Polish & Contrast Audit:** Added asynchronous order polling via Firestore `onSnapshot`. Fixed dark-mode CSS contrast for admin select dropdowns and notification popups. Verified complete git ignore coverage for environment secrets.

### Testing Webhooks Locally
Use the Stripe CLI to forward events to the local emulator:
```powershell
stripe listen --forward-to http://127.0.0.1:5001/the-pantheon-358ec/us-central1/stripeWebhook
```