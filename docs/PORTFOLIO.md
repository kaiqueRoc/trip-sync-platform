# TripSync — Portfólio (ecossistema completo)

**Autor:** Kaique Rocha  
**Contexto:** Projeto de portfólio técnico — plataforma B2B de reservas e integrações para agências de viagem (multi-tenant).

---

## Resumo em uma frase (para formulários / LinkedIn)

> Ecossistema **TripSync** em 4 repositórios: contratos schema-first (Zod/OpenAPI), API REST (Fastify), console operacional (React) e plataforma full-stack (Next.js) com multi-tenant, RBAC e trilha de auditoria.

---

## Texto pronto para e-mail (copiar e colar)

Olá,

Compartilho um projeto de portfólio que desenvolvi para demonstrar arquitetura de produto B2B em viagens:

**TripSync** — gestão de reservas multi-tenant para agências, com API schema-first, console operacional e plataforma web completa.

**Repositórios (GitHub):**

| Repositório | Papel |
|-------------|--------|
| [trip-sync-contracts](https://github.com/kaiqueRoc/trip-sync-contracts) | Schemas Zod, tipos TS e OpenAPI 3.1 compartilhados |
| [trip-sync-api](https://github.com/kaiqueRoc/trip-sync-api) | API REST (Fastify, Prisma), webhooks, fila de sync |
| [trip-sync-ops](https://github.com/kaiqueRoc/trip-sync-ops) | Console React (Vite, TanStack Query, MSW) |
| [trip-sync-platform](https://github.com/kaiqueRoc/trip-sync-platform) | App Next.js 15 — auth, RBAC, dashboard, auditoria |

**Destaques técnicos:** isolamento por `organizationId`, validação compartilhada via `@trip-sync/contracts`, ADRs documentados, CI em GitHub Actions, idempotência em criação de reservas na API.

**Demo local (plataforma):** após `npm run dev`, acesse a home do projeto — há credenciais de demonstração na página e em `README.md` (`owner@demo.tripsync` / `Demo@2025`).

Perfil: https://github.com/kaiqueRoc

Atenciosamente,  
Kaique Rocha

---

## English elevator pitch (optional)

**TripSync** is a portfolio-grade travel B2B stack: shared Zod/OpenAPI contracts, a Fastify REST API with webhooks and sync jobs, a React ops console, and a Next.js multi-tenant platform with RBAC and audit logs. Four repos, schema-first design, documented ADRs, and CI on every package.

---

## Arquitetura do ecossistema

```
                    ┌─────────────────────────┐
                    │  trip-sync-contracts   │
                    │  Zod + OpenAPI 3.1       │
                    └───────────┬─────────────┘
                                │ @trip-sync/contracts
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
 ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
 │ trip-sync-api   │  │ trip-sync-ops   │  │ trip-sync-platform   │
 │ Fastify + Prisma│  │ Vite + React 19 │  │ Next.js 15 + Prisma  │
 │ /docs OpenAPI   │  │ MSW fallback    │  │ NextAuth + RBAC      │
 └─────────────────┘  └─────────────────┘  └──────────────────────┘
```

---

## O que cada repositório demonstra

### trip-sync-contracts

- Design **schema-first**: uma fonte de verdade para validação e documentação.
- Geração de **OpenAPI 3.1** a partir de Zod; CI detecta drift (`docs:check`).
- Pacote npm consumido pela API, ops e platform.

### trip-sync-api

- **Fastify 5** com `fastify-type-provider-zod`.
- CRUD de reservas, provedores, **sync jobs**, **webhooks** de provedor.
- `POST /bookings` **idempotente**; correlation id (`x-correlation-id`).
- Swagger UI em `/docs` alimentado pelo contrato OpenAPI.
- Prisma (SQLite demo / PostgreSQL-ready).

### trip-sync-ops

- Console para operadores: dashboard, reservas, provedores, fila de sync.
- **TanStack Query**, React Hook Form + contratos Zod.
- **MSW** para dev offline e fallback quando a API não está no ar.
- Tipos gerados com `openapi-typescript`.

### trip-sync-platform (este repo)

- **Multi-tenant** por organização; queries sempre filtradas por `organizationId` (ADR 001).
- **RBAC:** OWNER, OPERATOR, VIEWER.
- Server Actions com validação via `@trip-sync/contracts`.
- Trilha de **auditoria** por tenant.
- NextAuth v5 (credentials + GitHub opcional).

---

## Credenciais de demonstração

| Papel | E-mail | Senha |
|-------|--------|-------|
| OWNER | `owner@demo.tripsync` | `Demo@2025` |
| OPERATOR | `operator@demo.tripsync` | `Demo@2025` |
| VIEWER | `viewer@demo.tripsync` | `Demo@2025` |

Organização seed: **Demo Agency** — reserva exemplo `BK-DEMO0001`.

---

## Como rodar a demo completa (local)

```bash
# 1. Contratos (obrigatório para todos)
cd trip-sync-contracts && npm ci && npm run build

# 2. API (porta 3333, docs em /docs)
cd ../trip-sync-api && cp .env.example .env && npm ci
npm run db:generate && npm run db:push && npm run db:seed && npm run dev

# 3. Ops (porta 5173) — opcional
cd ../trip-sync-ops && npm ci && npm run dev

# 4. Platform (porta 3000)
cd ../trip-sync-platform && cp .env.example .env && npm ci
npx prisma db push && npx prisma db seed && npm run dev
```

Abra http://localhost:3000 — a página inicial é o **preview de portfólio**; use **Entrar na demo** para o dashboard.

---

## Deploy sugerido (mostrar ao recrutador)

| App | Sugestão | URL / nota |
|-----|----------|------------|
| **trip-sync-platform** (preview) | GitHub Pages | https://kaiqueRoc.github.io/trip-sync-platform/ — ver `docs/DEPLOY.md` |
| **trip-sync-platform** (login) | Vercel + Neon | `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL` PostgreSQL |
| **trip-sync-api** | Railway / Render | `/health` e `/docs` |
| **trip-sync-ops** | Vercel / Netlify | `VITE_API_URL` → API |

Guia passo a passo: [`docs/DEPLOY.md`](./DEPLOY.md).

---

## Decisões documentadas (ADRs)

- Platform: `docs/adr/001-tenant-isolation.md`
- Contracts: `docs/adr/001-schema-first-zod.md` (no repo contracts)

---

## Skills evidenciadas (checklist para RH/técnico)

- [ ] TypeScript end-to-end  
- [ ] API design (REST, OpenAPI, idempotência)  
- [ ] Frontend (React 19, Next.js 15 App Router)  
- [ ] Persistência (Prisma, modelagem multi-tenant)  
- [ ] Segurança (auth, RBAC, isolamento de tenant)  
- [ ] Observabilidade / ops (audit log, health, correlation id)  
- [ ] Qualidade (lint, typecheck, testes, CI)  
- [ ] Documentação (README, ADR, preview público)

---

## Licença

MIT — projetos de portfólio público.
