# 🛠 NovaCart Pro: Engineering Workshop Log

This document tracks the architectural decisions and refactoring phases executed during the development of NovaCart Pro.

## The Goal
The objective was not to build another generic e-commerce template, but to engineer a robust, scalable application using Vanilla JavaScript. The focus was on understanding the "why" behind modern frameworks (React, Vue) by building the underlying systems (Routers, State Stores, DOM Rehydration) from scratch.

## Key Engineering Sprints

### Sprint: The Monolith Breakdown
*   **Problem:** The initial `Dashboard.js` and `Profile.js` files were massive "God files" handling UI, database fetching, and state simultaneously.
*   **Solution:** Applied the Single Responsibility Principle. Split the dashboard into `ProductList.js`, `ProductForm.js`, and `Orders.js`. Created modular sub-routing in `main.js` to handle these specific views.

### Sprint: The Custom SPA Router
*   **Implementation:** Built a hash-based router (`window.location.hash`) that dynamically matches strings to component functions. 
*   **Advanced Routing:** Upgraded the router to extract dynamic parameters (e.g., parsing the ID from `#/dashboard/products/edit/123xyz`) and pass them to the initialization functions.
*   **Route Guards:** Implemented middleware-style checks to bounce unauthenticated users to `#login` and non-admins away from `#dashboard`.

### Sprint: Media & Database Architecture
*   **Constraint:** Firestore restricts documents to 1MB. We needed to support rich product pages (10 images, highlights, videos) without introducing paid Cloud Storage buckets.
*   **Engineering Solution:** 
    1. Built a client-side HTML5 Canvas compressor to shrink uploaded images before converting them to Base64.
    2. Enforced a hard limit of 10 images per product.
    3. Required external URLs for video hosting (iframes) to keep the database payload incredibly light.

### Sprint: Memory Management
*   **Problem:** Implementing a 4-second autoplay slider on the Product Details page created a memory leak. Because it's an SPA, the `setInterval` kept running even after the user navigated back to the catalog.
*   **Solution:** Built a "self-cleaning" timer that checks for the existence of the DOM container (`document.getElementById`) on every tick. If the container is gone, the interval permanently clears itself.

## Final Thoughts
Building NovaCart Pro provided invaluable experience in DOM manipulation, asynchronous JavaScript, Firebase integration, and CSS Grid. It proves that clean architecture and modular design do not require a heavy framework—they require disciplined engineering.