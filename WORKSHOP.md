# NovaCart Pro
## Current Version
v1.0

## Current Sprint
Sprint 8: Search Functionality

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

## Decisions
- Vanilla JavaScript (ES Modules, Vite)
- UI Components are standard functions returning HTML string literals
- Centralized UI assembly in a Layout wrapper
- Single Page Application (SPA) architecture using hash routing (`window.location.hash`)
- Interactivity handled by exporting isolated `init` functions that attach event listeners post-render

## Next Task
- Begin Sprint 8: Search Functionality (Adding a search bar and global product search)