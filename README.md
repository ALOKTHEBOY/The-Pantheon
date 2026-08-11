# 🏛️ The Pantheon
**Because you already own everything else.**

The Pantheon is a high-end, parody e-commerce Single Page Application (SPA) designed for billionaires, time-travelers, and galactic overlords. It features a fully custom-built Content Management System (CMS), dynamic routing, and Firebase backend integration.

## 🚀 Live Demo
**[Visit The Pantheon](https://the-pantheon-358ec.web.app)**

## ✨ Core Features
*   **Dynamic Hero Engine:** A fully customizable homepage carousel managed directly from the Admin Dashboard, featuring image compression and specific product routing.
*   **Custom CMS:** A secure admin dashboard to add, edit, and delete artifacts, as well as configure the trending and tech sections on the homepage.
*   **Firebase Architecture:** 
    *   **Authentication:** Secure email/password login with role-based access control (Admin vs. Customer).
    *   **Firestore Database:** NoSQL database handling product catalogs, user wishlists, order histories, and homepage layouts.
    *   **Hosting:** Blazing fast global CDN deployment.
*   **Smart Fallback System:** If the database is empty, the UI automatically renders a localized demo catalog to ensure the interface never breaks.
*   **State Management:** Lightweight, custom-built reactive stores for Cart, Wishlist, Notifications, and Authentication without relying on heavy frameworks.

## 🛠️ Tech Stack
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **Bundler:** Vite
*   **Backend:** Google Firebase (Auth, Firestore, Hosting)
*   **Routing:** Custom Hash-based SPA Router

## 📦 Local Development Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/ALOKTHEBOY/The-Pantheon.git
   cd The-Pantheon
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Firebase:**
   Create a Firebase project, enable Firestore and Authentication, and replace the config object in `src/services/firebase.js`.

4. **Run the local development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🛡️ Security Rules
To ensure the CMS is protected, Firestore rules are configured to only allow admin write access while keeping product reads open to the public. See `WORKSHOP.md` for the exact rule configuration.

---
*© 2026 The Pantheon. All temporal and galactic rights reserved.*