# NovaCart Pro
## Current Version
v2.1

## Current Sprint
Sprint 12: State Persistence & Checkout Finalization

## Completed
- Environment setup & Vite installation
- Built base application shell and folder architecture
- Created design tokens and global reset
- Extracted Header, Footer, and Layout components
- Built responsive grid and flexbox utilities
- Built dynamic navigation menu in Header
- Implemented currency formatting utility
- Created dummy product data
- Built reusable ProductCard component and mapped data to grid
- Built a hash-based client-side router in main.js
- Rendered full product catalog and filter UI in Products page
- Upgraded router to support component initialization lifecycle
- Implemented dynamic category filtering logic
- Built global search functionality and multi-condition filtering
- Created global Cart Store with CustomEvent dispatching
- Implemented global event delegation for Cart interactions
- Made Header Cart counter reactive to global state
- Built CartItem component and dynamic Cart page UI
- Implemented item removal logic and forced re-rendering via router
- Created Checkout page with form validation
- Persisted Cart Store data to browser `localStorage`
- Implemented cart clearing logic upon successful order submission

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- UI Components are standard functions returning HTML string literals
- Centralized UI assembly in a Layout wrapper
- Single Page Application (SPA) architecture using hash routing
- Global State Management handled via plain objects and standard browser `CustomEvent` API
- State persistence managed via Web Storage API (`localStorage`)

## Next Task
- Begin Sprint 13: Product Details Page & Dynamic Routing