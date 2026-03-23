# Claude.md

## 📌 Project Overview

**Operly** is a multi-tenant SaaS platform for car wash businesses (lava-rápidos). Built with a fullstack TypeScript architecture, it provides:

- Customer & vehicle management
- Service scheduling & appointments
- Service orders & payments
- Business analytics & reporting
- Landing page with lead capture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Express + TypeScript (tsx) |
| Frontend | React 19 + Vite + TailwindCSS v4 |
| Database | PostgreSQL + Drizzle ORM |
| State | React Query (TanStack Query) |
| UI | Radix UI + shadcn/ui components |
| Auth | Passport.js + bcryptjs + sessions |

---

## 🏗️ Architecture

```
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Backend (Express)
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data layer
│   └── vite.ts          # Vite integration
├── shared/              # Shared code
│   └── schema.ts        # Drizzle schema + Zod validation
└── script/              # Build scripts
```

### Database Schema (Multi-tenant)
- `businesses` - Car wash businesses (tenants)
- `users` - Staff members with roles (owner/employee)
- `customers` - Business clients
- `vehicles` - Customer vehicles
- `services` - Available services (lavagem, estética)
- `appointments` - Scheduled appointments
- `serviceOrders` - Completed orders with payments
- `leads` - Landing page form submissions

---

## 🔁 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start backend (development) |
| `pnpm dev:client` | Start frontend (Vite dev server, port 5000) |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm check` | TypeScript type checking |
| `pnpm db:push` | Push schema changes to database |

---

## 🧠 AI Rules

### 1. Project Structure
- `server/` → Backend only (Express, API, auth)
- `client/` → Frontend only (React, UI, pages)
- `shared/` → Shared types, schemas, validation

### 2. Code Quality
- **No `any` types** - Use proper TypeScript types
- **Validate with Zod** - Use schemas from `shared/schema.ts`
- **Keep routes thin** - Move business logic to services/storage

### 3. Database
- Use Drizzle ORM exclusively (no raw SQL)
- Schema lives in `shared/schema.ts`
- Run `pnpm db:push` after schema changes

### 4. Frontend
- Use React Query for server state
- Use shadcn/ui components from `client/src/components/ui/`
- Keep components small and focused
- Use `wouter` for routing

### 5. Auth & Security
- Sessions stored in PostgreSQL (`connect-pg-simple`)
- Passwords hashed with bcryptjs
- **Never expose secrets in code**

### 6. Multi-tenancy
- All queries must filter by `businessId`
- Users belong to a business
- Respect `businessRole` permissions (owner vs employee)

---

## 🔐 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-secret-key
```

---

## 🚀 Development

```bash
# Start backend
pnpm dev

# Start frontend (separate terminal)
pnpm dev:client
```

---

## ✅ CI/CD Pipeline

GitHub Actions runs on push to `main`/`develop` and PRs to `main`:

1. **Install** - `pnpm install --frozen-lockfile`
2. **Type Check** - `pnpm check`
3. **Build** - `pnpm build`

**Before committing, ensure:**
```bash
pnpm install
pnpm check
pnpm build
```

---

## 📝 Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` New feature
- `fix(scope):` Bug fix
- `refactor(scope):` Code refactoring
- `chore(scope):` Maintenance tasks
- `docs(scope):` Documentation

Example: `feat(appointments): add calendar view`

---

## 🚫 Don'ts

- ❌ Break the build (`pnpm check` / `pnpm build` must pass)
- ❌ Use `any` type
- ❌ Mix frontend/backend code
- ❌ Commit secrets or `.env` files
- ❌ Write raw SQL (use Drizzle)
- ❌ Ignore TypeScript errors

---

## 📈 Roadmap

- [ ] Docker containerization
- [ ] CI/CD deployment pipeline
- [ ] WhatsApp integration
- [ ] Payment gateway (PIX)
- [ ] Mobile app (React Native)