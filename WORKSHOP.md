# NovaCart Pro
## Current Version
v2.1

## Current Sprint
Sprint 17: Mock API Simulation

## Completed
- Environment setup & Vite architecture
- Created design tokens, global reset, and responsive layout utilities
- Extracted Header, Footer, and Layout components
- Built dynamic navigation menu in Header
- Implemented currency formatting utility and dummy data
- Built reusable ProductCard component and mapped data to grid
- Created global Cart Store (LocalStorage) with CustomEvent dispatching
- Implemented global event delegation for Cart interactions
- Built Cart page UI, removal logic, and Checkout form validation
- Upgraded hash router to parse dynamic URL parameters
- Built transient Toast Notification utility
- Implemented graceful empty states and filter reset logic
- Fixed LocalStorage hydration bug and implemented active navigation state
- Built mock API service with Promises and simulated network delay
- Refactored entire application (Home, Products, Details, Cart interactions) to handle asynchronous data fetching and loading states

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- UI Components are standard functions returning HTML string literals
- Single Page Application (SPA) architecture using hash routing
- Interactivity and Data Fetching handled by exporting isolated `init` functions
- Asynchronous operations handled via native `Promises` and `async/await`
- Global State Management handled via `localStorage` and `CustomEvent` API
- Micro-interactions (like disabling buttons during network requests) used to prevent duplicate actions

## Next Task
- Begin Sprint 18: Performance & Final Polish