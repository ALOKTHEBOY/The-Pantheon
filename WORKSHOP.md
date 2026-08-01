# NovaCart Pro
## Current Version
v2.1

## Current Sprint
Sprint 11: Checkout Flow & Form Validation

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
- Handled form submission and redirection

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- UI Components are standard functions returning HTML string literals
- Centralized UI assembly in a Layout wrapper
- Single Page Application (SPA) architecture using hash routing (`window.location.hash`)
- Interactivity handled by exporting isolated `init` functions that attach event listeners post-render
- Form state managed by reading DOM values centrally during `input`, `change`, and `submit` events
- Global State Management handled via plain objects and standard browser `CustomEvent` API
- Navigation between major flows (Cart -> Checkout) handled via semantic `<a>` tags utilizing the hash router

## Next Task
- Finalize Sprint 11: Clear cart state upon successful checkout