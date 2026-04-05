# Development Database Setup

Two options for development database:

| Option | Speed | Use When |
|--------|-------|----------|
| **Docker Local** | ⚡ Fast | Day-to-day development |
| **Neon Remote** | 🐢 Slower | Need shared data with team |

---

## 🐳 Option 1: Docker Local (Recommended)

Each developer runs their own PostgreSQL locally.

### Prerequisites
- Docker Desktop installed

### Setup

```bash
# Start PostgreSQL container
docker compose -f docker-compose.dev.yml up -d

# Copy env template
cp .env.local.example .env

# Push schema
pnpm db:push

# Run app
pnpm dev
```

### Connection String
```
postgresql://operly:operly123@localhost:5432/operly_dev
```

### Commands
```bash
# Start database
docker compose -f docker-compose.dev.yml up -d

# Stop database
docker compose -f docker-compose.dev.yml down

# Reset database (delete all data)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
pnpm db:push

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

---

## ☁️ Option 2: Neon Remote (Shared)

Shared database for team collaboration using [Neon](https://neon.tech).

### When to Use
- Testing with shared data
- Staging environment
- Can't run Docker locally

### Setup

1. Get credentials from team lead
2. Copy to `.env.development`:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/operly_dev?sslmode=require
SESSION_SECRET=dev-secret-change-in-prod
```
3. Run: `pnpm dev`

### Neon Free Tier Limits
- **Storage**: 0.5 GB
- **Compute**: 191 hours/month
- **Branches**: 10

---

## 🔄 Schema Changes

When someone changes `shared/schema.ts`:

```bash
# Push to your database (local or remote)
pnpm db:push
```

---

## 🛠️ Useful Commands

```bash
# Push schema changes
pnpm db:push

# View database with Drizzle Studio
npx drizzle-kit studio

# Run tests
pnpm test
```

---

## ❓ Troubleshooting

### Docker: Port 5432 already in use
```bash
# Check what's using the port
netstat -ano | findstr :5432

# Or change port in docker-compose.dev.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Neon: Connection refused
- Check if connection string has `?sslmode=require`
- Verify Neon project is not paused (check dashboard)

### Schema out of sync
```bash
pnpm db:push
```
