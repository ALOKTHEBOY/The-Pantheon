## Version 3.1: Architectural Refactoring & Modular SPA Routing

**The Problem:**
As the application grew, `Dashboard.js` and `Profile.js` became monolithic "God files," handling multiple distinct responsibilities (UI rendering, Firebase queries, state management) and approaching an unmaintainable size. Furthermore, navigating between admin views felt clunky without dedicated URLs.

**The Solution:**
*   **Domain-Driven Design:** Restructured the `src/pages/` directory into domains (`Dashboard/` and `Profile/`).
*   **Sub-Routing:** Upgraded the custom SPA router in `main.js` to parse URL sub-paths (e.g., `#/dashboard/orders`), treating each feature as an independent view rather than rendering everything on one long scrolling page.
*   **Component Encapsulation:** Extracted a reusable `Dropdown.js` component to handle premium UI navigation, interacting seamlessly with the new sub-routes.

**New Engineering Standard Established:**
*   **The 300-Line Rule:** If a file grows beyond 250–300 lines or handles more than one major responsibility (violating the Single Responsibility Principle), development must pause for refactoring.