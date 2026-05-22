# TripSync Platform

Plataforma multi-tenant de gestão de reservas para agências de viagem. Parte do monorepo TripSync (portfólio).

## Stack

- **Next.js 15** (App Router)
- **Prisma** + SQLite (demo local)
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
# Na pasta trip-sync-contracts (se ainda não buildou)
cd ../trip-sync-contracts && npm ci && npm run build

cd ../trip-sync-platform
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
| `DATABASE_URL`     | SQLite, ex.: `file:./dev.db`       |
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
