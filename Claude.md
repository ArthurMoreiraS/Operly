# Claude.md

## 📌 Project Overview

Operly is a fullstack TypeScript application using:

- Express (backend)
- Vite + React (frontend)
- Drizzle ORM (database)
- PostgreSQL (via pg)
- TailwindCSS (UI)

The project is structured to behave like a lightweight SaaS-ready platform.

---

## 🏗️ Architecture


server/
├── index.ts
├── routes/
├── db/

client/
├── src/
├── components/
├── pages/


---

## ⚙️ Tech Stack

### Backend
- Express
- TypeScript (tsx)
- Drizzle ORM
- PostgreSQL

### Frontend
- React 19
- Vite
- TailwindCSS
- React Query

---

## 🔁 Scripts

- pnpm dev → backend
- pnpm dev:client → frontend
- pnpm build → build
- pnpm start → production
- pnpm check → typecheck
- pnpm db:push → database

---

## 🧠 AI Rules

### 1. Never break runtime
Backend:

pnpm dev


Frontend:

pnpm dev:client


---

### 2. Separation

- server → backend
- client → frontend
- db → database

---

### 3. Express

- Keep routes thin
- Move logic out of routes
- Validate with Zod

---

### 4. Database (Drizzle)


pnpm db:push


- Keep schema updated
- Avoid raw SQL

---

### 5. Type Safety

- No `any`
- Fix all TS errors


pnpm check


---

### 6. Frontend

- Use React Query
- Small components
- Avoid unnecessary state

---

### 7. Auth

- passport + session
- bcrypt for passwords
- Never expose secrets

---

### 8. CI Awareness

Changes must not break:
- install
- check
- build

---

### 9. Environment


DATABASE_URL=
SESSION_SECRET=


---

## 🚀 Local

Backend:

pnpm dev


Frontend:

pnpm dev:client


---

## 🧪 Validation

Before merge:


pnpm install
pnpm check
pnpm build


---

## 🧾 Commits

- feat:
- fix:
- refactor:
- chore:

Example:

feat(auth): login system


---

## 🛑 Don't

- break build
- ignore TS
- mix frontend/backend
- commit secrets

---

## 📈 Future

- Docker
- CI/CD deploy
- SaaS architecture