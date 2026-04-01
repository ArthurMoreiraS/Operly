# 🔐 SECURITY.md (Hardened Version)

## 📌 Security Policy

Operly is designed with a security-first mindset, especially due to its multi-tenant architecture and handling of business-critical data.

We prioritize:
- Tenant isolation
- Secure authentication
- Data integrity
- Protection against common web vulnerabilities

---

## 🚨 Reporting a Vulnerability

DO NOT open public issues for security vulnerabilities.

Report privately:
- Email: felipekislyy@gmail.com
- GitHub Security Advisory

Include:
- Description
- Steps to reproduce
- Impact
- Proof-of-concept

Response SLA:
- 24–48h acknowledgment
- Fix based on severity
- Coordinated disclosure

---

## 🛡️ Supported Versions

| Version | Supported |
|--------|----------|
| main | ✅ |
| develop | ✅ |
| older | ❌ |

---

## 🏢 Multi-Tenant Isolation (CRITICAL)

- Every query MUST include businessId
- NEVER trust client-provided businessId
- Always derive businessId from session

Correct:
const businessId = req.user.businessId;

Wrong:
const { businessId } = req.body;

---

## 🔐 Authentication & Session Security

- Passwords hashed with bcrypt (salt ≥ 10)
- Sessions stored in PostgreSQL
- Strong SESSION_SECRET (≥ 32 chars)

Cookie config:
- httpOnly: true
- secure: production only
- sameSite: lax

---

## 🚦 Rate Limiting

Use express-rate-limit on:
- /login
- /register
- /api/*

---

## 🧱 Security Headers

Use helmet for:
- CSP
- XSS protection
- secure headers

---

## 🌐 CORS

Restrict origins:
- Allow only your frontend domain

---

## 🧪 Input Validation

- Validate ALL inputs with Zod
- Never trust frontend data

---

## 💉 Injection Protection

- No raw SQL
- Use Drizzle ORM only

---

## 🧠 Error Handling

- Do not expose stack traces
- Return generic errors to client

---

## 🔑 Secrets

- Never commit .env
- Use environment variables
- Rotate secrets periodically

Required:
DATABASE_URL
SESSION_SECRET

---

## 📦 Dependency Security

- Run: pnpm audit
- Keep dependencies updated

---

## 🔍 Logging

Log:
- login attempts
- suspicious activity

Never log:
- passwords
- tokens

---

## 🚀 Deployment Security

Mandatory:
- HTTPS
- secure cookies
- production mode

Recommended:
- Reverse proxy (NGINX / Cloudflare)
- WAF

---

## 🧪 Checklist

- pnpm check passes
- pnpm build passes
- auth tested
- tenant isolation verified
- rate limiting active
- CORS restricted
- helmet enabled

---

## 🚨 High-Risk Areas

- Auth routes
- Multi-tenant queries
- Payments (future)
- Public endpoints

---

## 📢 Disclosure Policy

- Fix first, disclose later
- Credit researchers if desired

---

## 🙏 Acknowledgments

We appreciate responsible disclosure and security contributions.
