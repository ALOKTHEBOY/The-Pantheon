# NovaCart Pro
## Current Version
v2.1

## Current Sprint
Sprint 13: Product Details Page & Dynamic Routing

## Completed
- Environment setup & Vite architecture
- Created design tokens, global reset, and responsive layout utilities
- Extracted Header, Footer, and Layout components
- Built dynamic navigation menu in Header
- Implemented currency formatting utility and dummy data
- Built reusable ProductCard component and mapped data to grid
- Rendered full product catalog and filter UI with search capabilities
- Created global Cart Store (LocalStorage) with CustomEvent dispatching
- Implemented global event delegation for Cart interactions
- Built Cart page UI, removal logic, and Checkout form validation
- Upgraded hash router to parse dynamic URL parameters (`#product/:id`)
- Built dynamic Product Details page

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- UI Components are standard functions returning HTML string literals
- Centralized UI assembly in a Layout wrapper
- Single Page Application (SPA) architecture using hash routing (`window.location.hash`)
- Interactivity handled by exporting isolated `init` functions
- Form state managed by reading DOM values centrally
- Global State Management handled via `localStorage` and `CustomEvent` API
- Button interactions managed via Global Event Delegation on the `document`

## Next Task
- Begin Sprint 14: Toast Notifications (User feedback system)