# TripSync Platform

Plataforma multi-tenant de gestão de reservas para agências de viagem. Parte do ecossistema TripSync (portfólio).

**Preview para empresas:** página pública em `/` após `npm run dev`, documento [`docs/PORTFOLIO.md`](docs/PORTFOLIO.md) e publicação em [`docs/DEPLOY.md`](docs/DEPLOY.md) (GitHub Pages + Vercel).

## Demo interativa (Vercel)

Deploy na Vercel com PostgreSQL (Neon grátis). Guia completo: [`docs/DEPLOY.md`](docs/DEPLOY.md).

**GitHub Pages (preview):** https://kaiqueroc.github.io/trip-sync-platform/

## Ecossistema TripSync

![TripSync Ecosystem](docs/portfolio-images/tripsync-ecossistema-cover.png)

O TripSync é dividido em quatro repositórios integrados:

- [trip-sync-platform](https://github.com/kaiqueRoc/trip-sync-platform) — aplicação Next.js com login, dashboard, reservas e auditoria.

  ![TripSync Platform dashboard](docs/portfolio-images/tripsync-platform-dashboard.png)

- [trip-sync-api](https://github.com/kaiqueRoc/trip-sync-api) — API REST Fastify com Prisma, webhooks, fila de sincronização e documentação OpenAPI.

  ![TripSync API cover](docs/portfolio-images/tripsync-api-cover.png)

- [trip-sync-ops](https://github.com/kaiqueRoc/trip-sync-ops) — console operacional React para acompanhar reservas, provedores e jobs.

  ![TripSync Ops cover](docs/portfolio-images/tripsync-ops-cover.png)

- [trip-sync-contracts](https://github.com/kaiqueRoc/trip-sync-contracts) — contratos compartilhados com Zod, tipos TypeScript e OpenAPI 3.1.

  ![TripSync Contracts cover](docs/portfolio-images/tripsync-contracts-cover.png)

## Stack

- **Next.js 15** (App Router)
- **Prisma** + PostgreSQL (local via Docker; Neon/Vercel em produção)
- **NextAuth v5** (credentials + GitHub opcional)
- **Zod** via [`@trip-sync/contracts`](../trip-sync-contracts) — schemas compartilhados com a API

## Funcionalidades

- Organizações (tenants) com isolamento por `organizationId`
- RBAC: `OWNER`, `OPERATOR`, `VIEWER`
- CRUD de reservas (Server Actions validadas com contratos)
- Trilha de auditoria por tenant
- ADR de isolamento: [`docs/adr/001-tenant-isolation.md`](docs/adr/001-tenant-isolation.md)

## Pré-requisitos

- Node.js ≥ 20
- Repositório `trip-sync-contracts` clonado ao lado deste projeto (`../trip-sync-contracts`)

## Setup rápido

```bash
cd trip-sync-platform
docker compose up -d
cp .env.example .env
npm ci
npx prisma db push
npx prisma db seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Credenciais demo (seed)

| Papel     | Email                    | Senha      |
|-----------|--------------------------|------------|
| OWNER     | `owner@demo.tripsync`    | `Demo@2025` |
| OPERATOR  | `operator@demo.tripsync` | `Demo@2025` |
| VIEWER    | `viewer@demo.tripsync`   | `Demo@2025` |

Organização: **Demo Agency** (`demo-agency`). Reserva seed: `BK-DEMO0001`.

> O login usa a **primeira membership** do usuário. Cada usuário demo pertence à mesma org com papéis diferentes — faça logout para trocar de papel.

## Variáveis de ambiente

| Variável           | Descrição                          |
|--------------------|------------------------------------|
| `DATABASE_URL`     | PostgreSQL, ex.: `postgresql://tripsync:tripsync@localhost:5432/tripsync` |
| `AUTH_SECRET`      | `openssl rand -base64 32`          |
| `AUTH_URL`         | URL pública, ex. `http://localhost:3000` |
| `AUTH_GITHUB_*`    | OAuth opcional                     |

## Scripts

| Comando        | Descrição                |
|----------------|--------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Generate Prisma + build Next |
| `npm run lint` | ESLint                   |
| `npm run typecheck` | `tsc --noEmit`      |
| `npm run db:push` | Sincroniza schema SQLite |
| `npm run db:seed` | Dados demo            |

## CI

GitHub Actions em [`.github/workflows/ci.yml`](.github/workflows/ci.yml): build dos contratos, `prisma db push`, seed, lint, typecheck e `npm run build`.

## Arquitetura (tenant)

Toda query de negócio filtra por `organizationId` da sessão JWT — nunca confia em IDs vindos do cliente sem checagem de membership. Ver ADR 001.
