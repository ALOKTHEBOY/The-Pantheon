# 🛒 NovaCart Pro

NovaCart Pro is a modern, modular Single Page Application (SPA) built to demonstrate advanced frontend architecture and backend integration without relying on heavy frameworks. It serves as a comprehensive portfolio project showcasing domain-driven design, custom routing, and real-time state management.

🔗 **Live Demo:** [NovaCart Pro on Netlify](https://novacart-pro.netlify.app/)  
🔗 **Repository:** [GitHub Repository](https://github.com/ALOKTHEBOY/novacart-pro)

## ✨ Main Features

**Customer Experience**
*   **Dynamic Product Catalog:** Real-time fetching, searching, and sorting of products.
*   **Rich Product Details:** Multi-image gallery with horizontal scrolling, key highlights, dynamic pricing, and integrated video players.
*   **Shopping Cart & Wishlist:** Persistent global state synced across the application with dedicated empty-state conversion funnels.
*   **Secure Checkout:** Direct "Buy Now" session overrides and validated shipping forms.
*   **Real-Time Notifications:** Event-driven bell alerts for order updates and system messages.

**Admin Experience (Role-Based Access)**
*   **Secure Dashboard:** Protected routes accessible only to authorized admin accounts.
*   **Catalog Management:** Dedicated List and Form views to Add, Edit, and Delete products, including primary image selection.
*   **Order Tracking:** Live view of customer orders with real-time status updating and filtering.

## 🏗 Architecture & Tech Stack

**Frontend**
*   **Vanilla JavaScript (ES6+):** Core logic, API services, and DOM manipulation.
*   **Vite:** Lightning-fast build tool and local development server.
*   **Custom SPA Router:** Hash-based routing system (`#/dashboard/products/edit/:id`) built from scratch with route guards, dynamic parameter parsing, and 404 handling.
*   **State Management:** Custom reactive stores (`cartStore`, `wishlistStore`, `notificationStore`) utilizing the Observer pattern and `localStorage`.
*   **CSS3:** Native CSS variables for theming (including a dynamic Light/Dark mode engine) and CSS Grid/Flexbox for fully responsive layouts.

**Backend (Firebase)**
*   **Firebase Authentication:** Secure email/password login, registration, and user profile management.
*   **Cloud Firestore:** NoSQL document database storing `users`, `products`, and `orders`.

---

## 👨‍💻 Author

**Alok Barman**  
*Frontend Developer*  
*   GitHub: [@ALOKTHEBOY](https://github.com/ALOKTHEBOY)