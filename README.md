# 🏛️ The Pantheon
**Because you already own everything else.**

The Pantheon is a high-end, parody e-commerce Single Page Application (SPA) designed for billionaires, time-travelers, and galactic overlords. It features a custom-built Content Management System (CMS), interactive community moderation, real-time database notifications, and Firebase backend integration.

## 🚀 Live Demo
**[Visit The Pantheon](https://the-pantheon-358ec.web.app)**

## ✨ Core Engineering Features
*   **Role-Based Access Control (RBAC):** Backend security enforced via Firebase Firestore Rules. Master Admins possess global read/write/delete privileges, while customers are strictly sandboxed to their own data.
*   **Real-Time Cloud Notifications:** Replaced local browser memory with Firestore `onSnapshot` listeners. Order updates (e.g., Pending to Shipped) trigger targeted, real-time cloud notifications to specific user accounts.
*   **Temporal Analytics Engine:** Custom JavaScript aggregation algorithm that pulls raw order arrays, parses nested items, and reduces the data into a mapped financial ledger tracking exact buyer movement and generated revenue.
*   **Dynamic Hero Engine:** A fully customizable homepage carousel managed directly from the Admin Dashboard, featuring native Canvas API image compression to bypass database limits.
*   **Interactive Artifact Ledgers (Reviews):** A robust community section featuring nested replies, like/dislike counters, and Smart DP (Display Picture) generation for users.

## 🛠️ Tech Stack
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **Bundler:** Vite
*   **Backend:** Google Firebase (Auth, Firestore, Hosting)
*   **Routing:** Custom Hash-based SPA Router

---
*© 2026 The Pantheon. All temporal and galactic rights reserved.*