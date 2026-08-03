# NovaCart Pro
## Current Version
v3.0 (Final)

## Project Status
COMPLETE

## Completed Sprints
- Environment setup & Vite architecture
- Built responsive layout and component system
- Implemented client-side hash routing (SPA)
- Built global Cart Store and UI reactions
- Integrated mock async API and loading states
- Built dynamic Product Catalog, Details, and Checkout flows
- Built transient Toast Notification utility
- Handled empty states and LocalStorage hydration
- Implemented Debounce utility to optimize search performance
- Implemented array sorting logic for price ordering
- Implemented persistent Dark Mode utilizing CSS Custom Properties
- Implemented Wishlist functionality and cross-wired with Cart

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- Event-driven state management (`CustomEvent`, `localStorage`)
- Performance optimized via debouncing high-frequency DOM events
- UI scalable through highly reusable string-literal components

## Deployment
- Codebase compiled via `npm run build`
- Production `dist` successfully deployed to Netlify via GitHub