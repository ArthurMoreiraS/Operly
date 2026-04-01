# Operly

**CRM SaaS para Lava-Rápidos e Estética Automotiva**

[![Status](https://img.shields.io/badge/Status-Beta-blue)](https://github.com/ArthurMoreiraS/Operly)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Operly é uma plataforma completa para gestão de lava-rápidos e centros de estética automotiva. Organize sua agenda, gerencie clientes e veículos, controle finanças e acompanhe o desempenho do seu negócio em tempo real.

---

## ✨ Funcionalidades

- 📅 **Agendamentos** — Calendário visual com status por cores
- 👥 **Clientes & Veículos** — Cadastro completo com histórico
- 🛠️ **Serviços** — Catálogo com preços e duração
- 💰 **Financeiro** — Ordens de serviço e controle de pagamentos
- 📊 **Dashboard** — Métricas e relatórios em tempo real
- 👨‍💼 **Equipe** — Gestão de funcionários com permissões
- 🌐 **Landing Page** — Página pública com captação de leads

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Express + TypeScript |
| Frontend | React 19 + Vite + TailwindCSS v4 |
| Banco de Dados | PostgreSQL + Drizzle ORM |
| UI | Radix UI + shadcn/ui |
| Auth | Passport.js + bcryptjs |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- pnpm
- PostgreSQL

### Instalação

```bash
git clone https://github.com/ArthurMoreiraS/Operly.git
cd Operly
pnpm install
```

### Configuração

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/operly
SESSION_SECRET=sua-chave-secreta-com-32-caracteres
```

### Executar

```bash
# Aplicar schema no banco
pnpm db:push

# Desenvolvimento
pnpm dev          # Backend
pnpm dev:client   # Frontend (outro terminal)

# Produção
pnpm build
pnpm start
```

---

## 📜 Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Backend em modo desenvolvimento |
| `pnpm dev:client` | Frontend com hot reload |
| `pnpm build` | Build de produção |
| `pnpm start` | Executa build de produção |
| `pnpm check` | Type check TypeScript |
| `pnpm db:push` | Sincroniza schema com banco |
| `pnpm test` | Executa testes (Jest) |
| `pnpm test:coverage` | Testes com relatório de cobertura |

---

## 🧪 Testes

```bash
pnpm test              # Todos os testes
pnpm test auth         # Testes específicos
pnpm test:coverage     # Com cobertura
```

---

## 🏗️ Arquitetura

```
├── client/          # React + Vite
├── server/          # Express API
├── shared/          # Schema + types compartilhados
└── script/          # Scripts de build
```

---

## 🔐 Segurança

- Multi-tenant com isolamento por `businessId`
- Sessões em PostgreSQL
- Senhas com bcrypt
- Validação com Zod

Veja [SECURITY.md](SECURITY.md) para detalhes.

---

## 🚀 CI/CD

| Pipeline | Trigger | Ações |
|----------|---------|-------|
| **CI** | Push/PR | Type check → Testes → Build |
| **CD** | Push main | Testes → Deploy Render |

**Secret necessário:** `RENDER_DEPLOY_HOOK`

---

## 🗺️ Roadmap

- [ ] Integração WhatsApp (notificações)
- [ ] Pagamento PIX automático
- [ ] App mobile
- [ ] API pública

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona funcionalidade'`
4. Push: `git push origin feat/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

MIT © [Arthur Moreira](https://github.com/ArthurMoreiraS)
