# 🏛️ The Pantheon
**Because you already own everything else.**

The Pantheon is a high-end, parody e-commerce Single Page Application (SPA) designed for billionaires, time-travelers, and galactic overlords. It features a fully custom-built Content Management System (CMS), interactive community moderation, and Firebase backend integration.

## 🚀 Live Demo
**[Visit The Pantheon](https://the-pantheon-358ec.web.app)**

## ✨ Core Features
*   **Dynamic Hero Engine:** A fully customizable homepage carousel managed directly from the Admin Dashboard, featuring image compression and specific product routing.
*   **Interactive Artifact Ledgers (Reviews):** A robust community section featuring nested replies, like/dislike counters, and Smart DP (Display Picture) generation for users.
*   **Inline Moderation:** Users can edit or delete their own reviews/comments directly inline, while Admins hold global override privileges.
*   **Cinematic Inspection:** High-end image magnifier (zoom-on-hover) built natively in vanilla JavaScript.
*   **Custom CMS:** A secure admin dashboard to add, edit, and delete artifacts, as well as configure the trending and tech sections on the homepage.
*   **Smart Fallback System:** If the database is empty, the UI automatically renders a localized demo catalog to ensure the interface never breaks.

## 🛠️ Tech Stack
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **Bundler:** Vite
*   **Backend:** Google Firebase (Auth, Firestore, Hosting)
*   **Routing:** Custom Hash-based SPA Router

## 📦 Local Development Setup
1. **Clone the repository:** `git clone https://github.com/ALOKTHEBOY/The-Pantheon.git`
2. **Install dependencies:** `npm install`
3. **Configure Firebase:** Create a Firebase project, enable Firestore and Authentication, and replace the config object in `src/services/firebase.js`.
4. **Run local server:** `npm run dev`

---
*© 2026 The Pantheon. All temporal and galactic rights reserved.*