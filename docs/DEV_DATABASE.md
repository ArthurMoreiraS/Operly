# Development Database Setup (Neon)

Guide to setup shared development database using [Neon](https://neon.tech).

## 🚀 Quick Setup

### 1. Create Neon Account
Go to [neon.tech](https://neon.tech) and sign up (free).

### 2. Create Project
- Project name: `operly-dev`
- PostgreSQL version: `16`
- Region: Choose closest to your team

### 3. Create Branch for Development
- Go to **Branches** → **New Branch**
- Name: `develop`
- This allows separate data from production

### 4. Get Connection String
- Go to **Dashboard** → **Connection Details**
- Copy the connection string:
```
postgresql://user:password@ep-xxx-yyy.us-east-1.aws.neon.tech/operly_dev?sslmode=require
```

### 5. Share with Team
Add to `.env.development`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx-yyy.us-east-1.aws.neon.tech/operly_dev?sslmode=require
SESSION_SECRET=dev-secret-change-in-prod
```

### 6. Push Schema
```bash
pnpm db:push
```

## 🔐 Security Notes

- **Never commit** `.env.development` to git
- Share credentials via **secure channel** (1Password, Bitwarden, etc)
- Neon connection requires SSL (`?sslmode=require`)

## 🌿 Branch Strategy

| Git Branch | Neon Branch | Purpose |
|------------|-------------|---------|
| `main` | `main` | Production (Render) |
| `develop` | `develop` | Shared dev/staging |
| `feature/*` | (optional) | Feature testing |

## 📊 Neon Free Tier Limits

- **Storage**: 0.5 GB
- **Compute**: 191 hours/month
- **Branches**: 10
- **Projects**: 1

More than enough for development!

## 🛠️ Useful Commands

```bash
# Push schema changes
pnpm db:push

# View database (optional - install drizzle-kit globally)
npx drizzle-kit studio

# Reset database (careful!)
# Go to Neon Dashboard → SQL Editor → Run:
# DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# Then: pnpm db:push
```

## 🔄 Syncing Schema

When someone changes `shared/schema.ts`:
1. They push to `develop` branch
2. They run `pnpm db:push` 
3. Team pulls code - schema already updated in shared DB

## ❓ Troubleshooting

### Connection refused
- Check if connection string has `?sslmode=require`
- Verify Neon project is not paused (check dashboard)

### Schema out of sync
```bash
pnpm db:push
```

### Need fresh data
Ask team lead to reset the develop branch in Neon dashboard.
