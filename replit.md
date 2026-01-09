# Menu Cafet - Application de Gestion des Menus

## Overview

Menu Cafet is a React-based web application for managing and displaying cafeteria menus at ORIF. The application provides both public-facing menu displays (daily and weekly views) and administrative functionality for menu editing. Built with React, Vite, and Ant Design, with ExpressJS backend and MySQL database.

**Target Deployment:** Debian 13 server (Datalik) - self-hosted solution without cloud dependencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Jan 9, 2026)

**Complete Supabase Removal - Migration to MySQL + JWT**
- Removed ALL Supabase dependencies from frontend
- Deleted obsolete files:
  - `src/services/MenuService.js` (was using Supabase)
  - `src/services/LocalMenuService.js` (localStorage fallback)
  - `src/lib/supabase.js` (Supabase client)
- Migrated all pages to use `ApiService.js`:
  - `WeekMenuPage.jsx`, `DailyMenu.jsx`, `WeekEditor.jsx`, `DateEditor.jsx`
  - `ImportMenuPage.jsx`, `ImportLocalMenuPage.jsx`, `WeekMenuPage2.jsx`
  - `AuthCallback.jsx`, `AuthCallbackDebug.jsx`
  - `App.jsx`, `useMenus.js`
- Migrated components:
  - `MenuDrawer.jsx`, `WeekDeletePicker.jsx`
- Application is now 100% MySQL-based, ready for Datalik deployment

**New API Endpoints Added**
- `GET /api/meals/week/:year/:week` - Get meals by week
- `POST /api/meals/assign` - Assign dish to meal by type
- `POST /api/meals/remove-dish` - Remove dish from meal by type
- `POST /api/meals/clear` - Clear all dishes from a meal

## Previous Changes (Dec 22, 2025)

**MySQL + JWT Migration**
- Migrated from Supabase/PostgreSQL to MySQL for Datalik deployment
- JWT authentication with username/password login fully implemented
- Frontend connected to Express API with JWT auth context
- Admin-only user registration (no public signup)
- Files:
  - `sql/schema.sql` - MySQL database schema (dishes, meals, meals_dishes, users)
  - `sql/seed.sql` - Test data + default admin user with bcrypt hash
  - `server/routes/auth.js` - JWT auth routes (login protected, register admin-only)
  - `src/services/ApiService.js` - Frontend API client with user management
  - `src/contexts/JwtAuthContext.jsx` - JWT auth context
  - `docs/MANUEL_INSTALLATION_DATALIK.md` - Complete deployment guide
- Default admin credentials: username "admin", password "admin123"
- JWT_SECRET should be set via environment variable in production

## System Architecture

### Frontend Architecture

**Core Framework**: React 18.3.1 with Vite 7.1.7 as the build tool

**UI Component Library**: Ant Design (antd) 5.28.0 provides the primary UI components, complemented by custom CSS for specific menu layouts and responsive behavior.

**Routing Strategy**: React Router DOM 7.9.5 handles client-side routing with support for:
- Public routes (menu display)
- Protected admin routes (menu editing)
- JWT-based authentication

**State Management**: The application uses React's built-in state management with Context API for authentication state sharing. Menu data is managed through custom hooks (`useMenus`, `useAuth`) that encapsulate business logic and API interactions.

**API Service**: Single centralized `ApiService.js` handles all API calls:
- Authentication (login, register, profile)
- Dishes CRUD operations
- Meals management (by date, by week)
- Menu assignment operations

**Responsive Design**: Mobile-first approach with specific optimizations for daily menu view on small screens. Weekly view maintains horizontal scroll on mobile devices for better usability. Breakpoints at 768px and 480px handle tablet and mobile layouts.

**CSS Strategy**: Component-scoped styling approach to avoid conflicts with third-party libraries like Ant Design. All generic element selectors (`table`, `th`, `td`) are now prefixed with menu container classes to ensure isolation.

### Data Architecture

**Database Schema (MySQL)**: Three-table design focused on the core domain:
- `dishes` - Menu items with types (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
- `meals` - Meal instances identified by date and type (MIDI/SOIR)
- `meals_dishes` - Junction table linking meals to their dishes
- `users` - User accounts with bcrypt password hashes and roles

**Data Flow**: Frontend -> ApiService.js -> Express API (port 3001) -> MySQL

**Fictive Data Fallback**: When MySQL is unavailable, the Express API returns fictive test data for development purposes.

### Authentication & Authorization

**Authentication Method**: JWT-based username/password authentication
- Username/password login
- JWT tokens with 7-day expiration
- Secure bcrypt password hashing
- Token stored in localStorage

**Security Layers**:
1. **JWT Middleware**: Express routes protected by token verification
2. **Admin-only registration**: Only existing admins can create new users
3. **Role-based access**: Admin and user roles control feature access

**Authorization Model**: Role-based access control (RBAC)
- `user` role: Default for authenticated users, read-only access
- `admin` role: Full CRUD permissions, user management

### Application Structure

**Component Organization**:
- `/components` - Reusable UI components (MenuDrawer, MenuTable, etc.)
- `/pages` - Route-level page components
- `/services` - API abstraction layer (ApiService.js only)
- `/hooks` - Custom React hooks for shared logic
- `/utils` - Helper functions (date manipulation, validation)
- `/contexts` - React Context providers for global state
- `/server` - Express.js backend API

**Build & Deployment Configuration**:
- Vite with React plugin for fast HMR during development
- Server configuration for 0.0.0.0:5000 for Replit deployment
- Express API on port 3001
- ESLint for code quality with React-specific rules

### Data Flow Patterns

**Menu Display Flow**:
1. Component mounts
2. Calls ApiService to fetch menu data from Express API
3. Transforms data into display format (grouped by day/meal)
4. Renders using Ant Design Table components with custom styling

**Menu Editing Flow**:
1. Admin navigates to edit route (protected by auth check)
2. Loads existing menu data via ApiService
3. User modifies menu items through form inputs
4. Changes saved via API calls
5. UI updates on success

**Date & Week Management**:
- ISO 8601 week numbering for consistent week calculations
- Utility functions handle week-to-date conversions
- Support for both single-day and weekly menu views

## External Dependencies

### Backend Services

**Express.js API** (port 3001)
- REST API for menu and auth operations
- MySQL database connection via mysql2 driver
- JWT authentication middleware
- CORS enabled for frontend access

**MySQL Database**
- Self-hosted on Datalik server
- Tables: dishes, meals, meals_dishes, users
- ENUMs for meal_type and dish_type

### UI & Styling

**Ant Design** (v5.28.0)
- Comprehensive React component library
- Provides Table, Form, Button, Drawer, DatePicker components
- Icons from @ant-design/icons package
- French locale (fr_FR) configured

**Custom CSS**
- `styles.css` - Global application styles with CSS variables
- `responsive.css` - Media queries for mobile optimization
- Design system based on neutral color palette with blue/cyan accents

### Utility Libraries

**date-fns** (v4.1.0)
- Date manipulation and formatting
- ISO week calculations
- Locale-aware date displays

**xlsx** (v0.18.5)
- Excel file parsing for menu imports
- Enables bulk menu upload from spreadsheets

**React Router DOM** (v7.9.5)
- Client-side routing with nested routes
- Protected route patterns for admin sections

**bcryptjs**
- Password hashing for user authentication

**jsonwebtoken**
- JWT token generation and verification

### Development Tools

**Vite** (v7.1.7)
- Lightning-fast development server with HMR
- Optimized production builds with code splitting
- Environment variable management

**ESLint** (v9.36.0)
- Code quality enforcement
- React-specific linting rules

### Deployment Platform

**Target: Debian 13 (Datalik)**
- Self-hosted at cafeteria.applications.ws
- nginx reverse proxy configuration
- MySQL database
- PM2 for process management
- Complete guide in `docs/MANUEL_INSTALLATION_DATALIK.md`

**Development: Replit**
- Vite configured for 0.0.0.0:5000 binding
- Express API on port 3001
- Workflows: "Start application" (frontend) and "API Express" (backend)
