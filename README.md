# 🛒 NovaCart Pro

NovaCart Pro is a modern, modular Single Page Application (SPA) built to demonstrate advanced frontend architecture and backend integration without relying on heavy frameworks. It serves as a comprehensive portfolio project showcasing domain-driven design, custom routing, and state management.

## 🚀 Live Demo
[View Live Project](https://novacart-pro.netlify.app/)[cite: 5]

## ✨ Main Features

**Customer Experience**
*   **Dynamic Product Catalog:** Real-time fetching, searching, and sorting of products.
*   **Rich Product Details:** Multi-image gallery with horizontal scrolling, key highlights, dynamic pricing, and integrated video players.
*   **Shopping Cart & Wishlist:** Persistent global state synced across the application.
*   **Secure Checkout:** Validated shipping forms that generate live database orders.
*   **User Profile:** Order history tracking, account settings, and secure password reset flows.

**Admin Experience (Role-Based Access)**
*   **Secure Dashboard:** Protected routes accessible only to authorized admin accounts.
*   **Catalog Management:** Dedicated List and Form views to Add, Edit, and Delete products.
*   **Rich Media Handling:** Supports up to 10 images (Canvas-compressed Base64) and external Video URLs.
*   **Order Tracking:** Live view of customer orders.

## 🏗 Architecture & Tech Stack

**Frontend**
*   **Vanilla JavaScript (ES6+):** Core logic, API services, and DOM manipulation.
*   **Vite:** Lightning-fast build tool and local development server.
*   **Custom SPA Router:** Hash-based routing system (`#/dashboard/products/edit/:id`) built from scratch with route guards and dynamic parameter parsing.
*   **State Management:** Custom reactive stores (`cartStore`, `wishlistStore`, `authStore`) utilizing the Observer pattern.
*   **CSS3:** Native CSS variables for theming (including Dark Mode) and CSS Grid/Flexbox for responsive layouts.

**Backend (Firebase)**
*   **Firebase Authentication:** Secure email/password login, registration, and user profile management.
*   **Cloud Firestore:** NoSQL document database storing `users`, `products`, and `orders`.

## 📂 Project Structure

\`\`\`text
src/
├── assets/         # Static images and icons
├── components/     # Reusable UI parts (Navbar, CartItem)
├── pages/          # Route-level modules
│   ├── Dashboard/  # Admin-only views (ProductList, ProductForm, Orders)
│   ├── Profile/    # Authenticated user views (History, Settings)
│   └── ...         # Public views (Home, Products, Checkout)
├── services/       # Firebase initialization and API wrappers
├── store/          # Global state management logic
├── styles/         # Modular CSS architecture
├── utils/          # Helper functions (Currency formatting, Toasts)
└── main.js         # Application entry point & Router
\`\`\`

## 🚀 How to Run Locally

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/YOUR-USERNAME/novacart-pro.git
    cd novacart-pro
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`
3.  **Configure Firebase:**
    *   Create a `.env` file in the root directory.
    *   Add your Firebase config keys (e.g., `VITE_FIREBASE_API_KEY=your_key`).
4.  **Start the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`

## ⚠️ Known Limitations (Free-Tier Architecture)

To keep this project entirely free to host and run, the following architectural compromises were made:
*   **Image Storage:** Images are compressed via HTML5 Canvas and stored as Base64 strings directly inside Firestore documents. This limits the maximum payload to Firestore's 1MB document limit.
*   **Video Hosting:** Videos rely on external URLs (YouTube, Vimeo, MP4 links) rather than native binary uploads to bypass storage costs.
*   **Payment Gateway:** The checkout process is a UI simulation. It successfully creates an order in the database but does not process real credit card transactions.

## 👨‍💻 Author
[ALOKTHEBOY](https://github.com/ALOKTHEBOY) - [GitHub Repository](https://github.com/ALOKTHEBOY/novacart-pro)[cite: 5]
