# Operly - CRM para Lava-Rápidos

## Overview

Operly is a minimalist, glassy-design SaaS CRM built specifically for car wash businesses and automotive detailing services in Brazil. The application replaces chaotic WhatsApp-based scheduling with professional organization tools. The MVP focuses on 6 essential modules: Dashboard, Scheduling, Customers/Vehicles, Services/Pricing, Finance, and Settings.

The platform provides a 360° business view with color-coded scheduling, automated WhatsApp reminders, customer/vehicle management with QR codes, service catalogs with dynamic pricing, financial reporting with service orders, and a customizable public booking page.

### Team Management
- Owners can manage team members via Settings > Equipe tab
- Two business roles: owner (full access) and employee (limited access)
- Employees cannot access Finanças or Configurações modules
- API endpoints: GET/POST/PATCH/DELETE /api/team (owner only)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom glassy design system
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON API with `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Design Patterns
- **Monorepo Structure**: Client (`/client`), Server (`/server`), Shared (`/shared`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for attached assets
- **Component Architecture**: Layout wrapper with fixed sidebar and header
- **Data Fetching**: Query-based with automatic caching and refetching

### Build System
- **Development**: Vite dev server with HMR, Express serves API
- **Production**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database operations with schema defined in `/shared/schema.ts`

### UI Framework
- **shadcn/ui**: Pre-built accessible components using Radix UI
- **Tailwind CSS v4**: Utility-first CSS with custom CSS variables for theming
- **Lucide React**: Icon library

### Core Libraries
- **TanStack Query**: Server state management and caching
- **date-fns**: Date manipulation with Portuguese (Brazil) locale support
- **Zod**: Runtime schema validation for API requests

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator
- **Custom meta-images plugin**: OpenGraph image handling for deployments