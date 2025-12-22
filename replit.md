# Menu Cafét - Application de Gestion des Menus

## Overview

Menu Cafét is a React-based web application for managing and displaying cafeteria menus at ORIF. The application provides both public-facing menu displays (daily and weekly views) and administrative functionality for menu editing. Built with React, Vite, and Ant Design, with ExpressJS backend and MySQL database.

**Target Deployment:** Debian 13 server (Datalik) - self-hosted solution without cloud dependencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Dec 22, 2025)

**MySQL + JWT Migration - NEW**
- Migrated from Supabase/PostgreSQL to MySQL for Datalik deployment
- Added JWT authentication with username/password login
- New files created:
  - `sql/schema.sql` - MySQL database schema
  - `sql/seed.sql` - Test data for MySQL
  - `server/routes/auth.js` - JWT authentication routes
  - `src/services/ApiService.js` - Frontend API client
  - `src/contexts/JwtAuthContext.jsx` - JWT auth context
  - `docs/DEPLOIEMENT_DEBIAN.md` - Deployment guide for Debian 13

**Express API Backend**
- Full REST API with Express.js on port 3001
- MySQL database connection with mysql2 driver
- Routes implemented:
  - Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
  - Dishes: `GET/POST/PUT/DELETE /api/dishes`
  - Meals: `GET/POST/DELETE /api/meals`
- Fictive data fallback when database is unavailable
- ES Module syntax (import/export)

**Calendar French Locale - FIXED**
- Configured Ant Design with French locale (fr_FR)
- Calendar now displays Monday-Sunday instead of Sunday-Saturday

## Previous Changes (Dec 3, 2025)

**Calendar CSS Isolation + Sexy Background - FIXED**
- Issue: Ant Design DatePicker calendar displayed only 2 columns instead of 7, broken responsiveness on all screen sizes
- Root cause: Generic CSS selectors (`table`, `thead th`, `td`) in styles.css were cascading to calendar elements
- Fix: Two-part solution combining CSS specificity and complete style reset
  1. Targeted menu styles to `.table-wrap` and `.daily-menu-view` classes only (lines 158-222 in styles.css)
  2. Applied `all: revert !important` to `.ant-picker-panel-container` to completely isolate calendar from app CSS
  3. Added sexy gradient background to calendar: `linear-gradient(135deg, #f0f9ff 0%, #cffafe 50%, #e0f2fe 100%)`
- Result: Calendar now displays 7 columns perfectly on all screen sizes with no style conflicts
- CSS optimizations:
  - Menu styles isolated with parent class selectors (`.table-wrap table`, `.daily-menu-view table`)
  - Calendar reset with `all: revert !important` prevents any global CSS interference
  - Calendar background: blue/cyan gradient matching app brand colors
  - Border-radius `8px` + shadow for modern appearance

**Previous: Friday Display Bug + Emoji Support - FIXED**
- Merged two conflicting approaches to show Friday with emojis
- Query now loads full week from Supabase, applies filterWeekdays to display Monday-Friday only
- Supabase prioritized over localStorage for current week data

## System Architecture

### Frontend Architecture

**Core Framework**: React 18.3.1 with Vite 7.1.7 as the build tool

**UI Component Library**: Ant Design (antd) 5.28.0 provides the primary UI components, complemented by custom CSS for specific menu layouts and responsive behavior.

**Routing Strategy**: React Router DOM 7.9.5 handles client-side routing with support for:
- Public routes (menu display)
- Protected admin routes (menu editing)
- Authentication callback handling

**State Management**: The application uses React's built-in state management with Context API for authentication state sharing. Menu data is managed through custom hooks (`useMenus`, `useAuth`) that encapsulate business logic and API interactions.

**Responsive Design**: Mobile-first approach with specific optimizations for daily menu view on small screens. Weekly view maintains horizontal scroll on mobile devices for better usability. Breakpoints at 768px and 480px handle tablet and mobile layouts.

**CSS Strategy**: Component-scoped styling approach to avoid conflicts with third-party libraries like Ant Design. All generic element selectors (`table`, `th`, `td`) are now prefixed with menu container classes to ensure isolation.

### Data Architecture

**Database Schema**: Simplified three-table design focused on the core domain:
- `dishes` - Menu items with types (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
- `meals` - Meal instances identified by date and type (MIDI/SOIR)
- `meals_dishes` - Junction table linking meals to their dishes

**Legacy Cleanup**: The database schema underwent significant simplification, removing redundant tables (menu_items, menu_days, menus, meal_types, categories, allergens) in favor of a more straightforward relational model. This reduces complexity and improves query performance.

**Data Persistence Strategy**: Dual-mode storage system:
- **Primary**: Supabase PostgreSQL database for production
- **Fallback**: Browser localStorage for development/offline scenarios
- Automatic detection and switching between modes based on Supabase availability

### Authentication & Authorization

**Authentication Method**: Magic Link email authentication via Supabase Auth
- Passwordless login flow
- Email-based one-time links
- Session persistence with automatic token refresh

**Security Layers**:
1. **Client-side validation**: Email whitelist with obfuscated hashes prevents unauthorized login attempts
2. **Server-side enforcement**: Database-level email whitelist table with triggers
3. **Row-Level Security (RLS)**: Supabase policies enforce read/write permissions based on user roles

**Authorization Model**: Role-based access control (RBAC)
- `viewer` role: Default for authenticated users, read-only access
- `admin` role: Manual promotion required, full CRUD permissions
- Profile system tracks user metadata and role assignments

**Graceful Degradation**: When Supabase is unconfigured, the application allows unrestricted access to admin features for development purposes. This enables local testing without requiring backend setup.

### Application Structure

**Component Organization**:
- `/components` - Reusable UI components (MenuDrawer, MenuTable, etc.)
- `/pages` - Route-level page components
- `/services` - API abstraction layers (MenuService, LocalMenuService)
- `/hooks` - Custom React hooks for shared logic
- `/utils` - Helper functions (date manipulation, validation, storage)
- `/contexts` - React Context providers for global state

**Build & Deployment Configuration**:
- Vite with React plugin for fast HMR during development
- Server configuration for 0.0.0.0:5000 for Replit deployment
- Dynamic redirect URL handling using window.location.origin for environment flexibility
- ESLint for code quality with React-specific rules

### Data Flow Patterns

**Menu Display Flow**:
1. Component mounts and checks Supabase availability
2. Loads menu data from Supabase or localStorage fallback
3. Transforms data into display format (grouped by day/meal)
4. Renders using Ant Design Table components with custom styling

**Menu Editing Flow**:
1. Admin navigates to edit route (protected by auth check)
2. Loads existing menu data or initializes empty structure
3. User modifies menu items through form inputs
4. Changes batched and saved to Supabase/localStorage
5. Optimistic UI updates with error rollback on failure

**Date & Week Management**:
- ISO 8601 week numbering for consistent week calculations
- Utility functions handle week-to-date conversions
- Support for both single-day and weekly menu views

## External Dependencies

### Backend Services

**Supabase** (v2.80.0)
- **Purpose**: Backend-as-a-Service providing PostgreSQL database, authentication, and real-time features
- **Configuration**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- **Features Used**:
  - PostgreSQL database with custom schema
  - Magic Link email authentication
  - Row-Level Security policies
  - Client library for database queries
- **Fallback**: Application functions without Supabase using localStorage

### UI & Styling

**Ant Design** (v5.28.0)
- Comprehensive React component library
- Provides Table, Form, Button, Drawer, DatePicker, and other UI primitives
- Icons from @ant-design/icons package
- Theming through CSS-in-JS system
- CSS isolation strategy: Component containers `.ant-picker-panel-container` use `all: revert !important` to prevent style cascade

**Custom CSS**
- `styles.css` - Global application styles with CSS variables for theming
- `responsive.css` - Media queries for mobile optimization
- Design system based on neutral color palette with blue/cyan accents

### Utility Libraries

**date-fns** (v4.1.0)
- Date manipulation and formatting
- Complements custom ISO week utilities
- Locale-aware date displays

**xlsx** (v0.18.5)
- Excel file parsing for menu imports
- Enables bulk menu upload from spreadsheets
- Used in admin workflows for efficiency

**React Router DOM** (v7.9.5)
- Client-side routing with nested routes
- Protected route patterns for admin sections
- Programmatic navigation for auth flows

### Development Tools

**Vite** (v7.1.7)
- Lightning-fast development server with HMR
- Optimized production builds with code splitting
- Environment variable management

**ESLint** (v9.36.0)
- Code quality enforcement
- React-specific linting rules
- Hooks validation for React best practices

### Deployment Platform

**Replit**
- Development and deployment environment with live preview
- Vite configured for 0.0.0.0:5000 binding for full Replit compatibility
- Dynamic environment detection (dev vs production) using window.location.origin
- Environment variables managed through Replit Secrets
- Automatic workflow configuration via npm scripts
- Documentation in `/docs` folder for setup

### Database Configuration

**PostgreSQL** (via Supabase)
- Custom ENUM types: `meal_type` (MIDI/SOIR), `dish_type` (menu categories)
- Foreign key relationships with CASCADE delete
- UNIQUE constraints for data integrity
- Prepared for future extensions (allergen tracking, nutritional info)
