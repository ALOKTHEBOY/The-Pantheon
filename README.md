# 🏛️ The Pantheon
**Because you already own everything else.**

A portfolio-focused luxury e-commerce Single Page Application (SPA) designed for billionaires, time-travelers, and galactic overlords. Built with Vanilla JavaScript, Firebase, and Stripe, demonstrating enterprise-grade payment architecture, strict server authorization boundaries, and real-time cloud notifications without relying on frontend frameworks like React or Vue.

## 🚀 Live Demo
**[Visit The Pantheon](https://the-pantheon-358ec.web.app)**

---

## 🛡️ V2 Payment Architecture & Trusted Server Boundary
This application uses **Stripe TEST MODE** for educational engineering purposes. The browser is strictly barred from declaring that a customer has paid or directly writing completed orders to the database.

```text
Customer Cart & Shipping Details
        ↓
   Checkout.js (Frontend)
        ↓  [HTTPS Callable]
prepareCheckout (Firebase Cloud Function)
        ↓  [Server queries Firestore authoritative prices]
True Cart Total Calculated (Server-side)
        ↓
Stripe TEST PaymentIntent Created (INR in Paise)
        ↓  [Returns client_secret]
Stripe Elements Mounted in Browser (Test Card: 4242...)
        ↓  [Customer confirms payment]
Stripe TEST Processing
        ↓  [Cryptographically signed HTTPS POST]
stripeWebhook (Firebase Cloud Function)
        ↓  [Constructs event & verifies Stripe signature with whsec_...]
Idempotency Verified (via payment_intent.id)
        ↓
Order Minted in Cloud Firestore ('orders/{payment_intent.id}')
        ↓
Targeted Cloud Notification Sent ('notifications' collection)
        ↓
Frontend onSnapshot Listener Triggers UI Confirmation & Redirects
```

### Key Architectural Safeguards
1. **Zero Client Price Trust:** The frontend `cartStore` calculates totals strictly for UI previews. When checkout begins, the `prepareCheckout` Cloud Function queries authoritative Firestore `products` documents to compute the real price. Any manipulated client prices (e.g. ₹1 hacks) are discarded.
2. **Secrets Sandbox:** All Stripe secret keys (`sk_test_...`) and webhook signing secrets (`whsec_...`) exist strictly on the backend inside Node.js Cloud Functions. The frontend only receives a safe publishable key (`pk_test_...`) and temporary `client_secret`.
3. **Cryptographic Signature Verification:** The `stripeWebhook` HTTP endpoint accesses raw request bodies and uses Stripe's official signature verification (`stripe.webhooks.constructEvent`) to block forged webhook requests.
4. **Guaranteed Idempotency:** The Stripe `payment_intent.id` is used directly as the Firestore order document ID. If Stripe retries a webhook delivery, the backend safely detects the existing order and skips duplication.
5. **Server-Authored Notifications:** Order fulfillment notifications originate directly from the trusted Cloud Function into Firestore, which the client-side `notificationStore` detects in real time via `onSnapshot`.

*(Note: No real money is processed. All transactions take place inside Stripe's test environment.)*

---

## ✨ Core Engineering Features
* **Role-Based Access Control (RBAC):** Backend security enforced via Firebase Firestore Rules. Master Admins possess global read/write/delete privileges, while customers are strictly sandboxed to their own data.
* **Real-Time Cloud Notifications:** Replaced local browser memory with Firestore `onSnapshot` listeners. Order updates and payment fulfillment trigger targeted, real-time cloud notifications to specific user accounts.
* **Temporal Analytics Engine:** Custom JavaScript aggregation algorithm that pulls raw order arrays, parses nested items, and reduces the data into a mapped financial ledger tracking buyer movement and generated revenue.
* **Dynamic Hero Engine:** A fully customizable homepage carousel managed directly from the Admin Dashboard, featuring native Canvas API image compression to bypass Firestore document limits.
* **Interactive Artifact Ledgers (Reviews):** A robust community section featuring nested replies, like/dislike counters, and Smart DP (Display Picture) generation for users.
* **High-Contrast Luxury Themes:** Custom Obsidian & Gold (Dark Mode) and Marble & Royal Purple (Light Mode) design system with full contrast compliance across admin controls and notification popups.

---

## 🛠️ Tech Stack
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Modern Flexbox & CSS Grid)
* **Bundler & Tooling:** Vite
* **Backend:** Firebase Cloud Functions (Node.js 18 runtime)
* **Database:** Cloud Firestore
* **Authentication:** Firebase Authentication
* **Hosting:** Firebase Hosting
* **Payments:** Stripe Node.js SDK & Stripe.js (Test Mode)
* **Routing:** Custom Hash-based SPA Router

---

## 💻 Local Development Setup

### 1. Clone & Install Frontend
```bash
git clone https://github.com/aloktheboy/The-Pantheon.git
cd The-Pantheon
npm install
```

### 2. Install Cloud Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### 3. Run Development Servers
```bash
# Terminal 1: Vite Dev Server
npm run dev

# Terminal 2: Firebase Functions Emulator
firebase emulators:start --only functions
```

---
*© 2026 The Pantheon. All temporal and galactic rights reserved.*