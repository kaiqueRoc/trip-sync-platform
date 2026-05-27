# Publicar TripSync (GitHub Pages + Vercel)

## Comparativo rápido

| Onde | O que roda | URL típica | Login / dashboard |
|------|------------|------------|-------------------|
| **GitHub Pages** | Preview estático (`docs/index.html`) | `https://kaiqueroc.github.io/trip-sync-platform/` | Não |
| **Vercel** | App Next.js completa | `https://seu-projeto.vercel.app` | Sim |

Use **GitHub Pages** para mandar link de portfólio rápido. Use **Vercel** para a empresa testar login e reservas.

---

## 1. GitHub Pages (esta pasta `docs/`)

### Passo A — Enviar o código

```bash
cd trip-sync-platform
git add docs/ .github/workflows/pages.yml
git commit -m "chore: GitHub Pages preview do portfólio TripSync"
git push origin main
```

### Passo B — Ativar no GitHub (repositório trip-sync-platform)

O workflow publica a branch `gh-pages`. **Uma vez** configure:

1. https://github.com/kaiqueRoc/trip-sync-platform → **Settings** → **Pages**  
2. **Build and deployment** → **Source**: **Deploy from a branch**  
3. Branch: **gh-pages** → pasta **/ (root)** → **Save**  
4. Aguarde 1–2 min → **https://kaiqueroc.github.io/trip-sync-platform/**

> A URL do GitHub Pages usa o usuário em **minúsculas**: `kaiqueroc.github.io`, não `kaiqueRoc.github.io`.

### Alternativa imediata (já no ar)

O mesmo preview está em **https://kaiqueroc.github.io/trip-sync-platform/** via repositório `kaiqueRoc.github.io` (atualizado no push do portfólio pessoal).

---

## 2. Vercel (demo com login)

### Passo A — Banco PostgreSQL (grátis)

A Vercel **não** persiste SQLite. Use um destes:

- [Neon](https://neon.tech) — crie um projeto → copie a connection string  
- Ou `docker compose up -d` local e use a mesma URL em produção (não recomendado para prod)

Exemplo Neon:

```text
DATABASE_URL="postgresql://USER:PASS@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Passo B — Importar no Vercel

1. https://vercel.com → **Add New** → **Project**  
2. Importe **kaiqueRoc/trip-sync-platform**  
3. Framework: **Next.js** (detectado automaticamente)  
4. **Environment variables**:

| Nome | Valor |
|------|--------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) |
| `AUTH_SECRET` | Saída de `openssl rand -base64 32` |
| `AUTH_URL` | `https://SEU-DOMINIO.vercel.app` (sem barra no final) |

5. **Deploy**

O `vercel.json` já roda `prisma db push` e `seed` no build (dados demo recriados a cada deploy).

### Passo C — Contratos npm

O `package.json` usa `@trip-sync/contracts` via GitHub (`github:kaiqueRoc/trip-sync-contracts`). A Vercel instala e compila no `prepare` do pacote — não precisa do repo irmão no disco.

### Passo D — PostgreSQL no Prisma (produção)

Para Vercel, use `DATABASE_URL` PostgreSQL. Localmente você pode:

- **Opção A:** `docker compose up -d` e  
  `DATABASE_URL="postgresql://tripsync:tripsync@localhost:5432/tripsync"`  
- **Opção B:** manter SQLite só local alterando temporariamente o `provider` em `schema.prisma` (não misture com deploy Vercel).

Após o primeiro deploy, teste:

- Home: `/` (preview)  
- Login: `/login` — `owner@demo.tripsync` / `Demo@2025`

---

## 3. Link no portfólio pessoal

No site https://kaiqueroc.github.io, adicione um card apontando para:

- Pages: https://kaiqueroc.github.io/trip-sync-platform/  
- Vercel: sua URL após o deploy  

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Pages 404 | Settings → Pages → Source = GitHub Actions; workflow verde em Actions |
| Vercel build falha em contratos | Confirme repo `trip-sync-contracts` público e tag `main` acessível |
| Login não funciona na Vercel | `AUTH_URL` deve ser exatamente a URL pública; `AUTH_SECRET` definido |
| Erro Prisma na Vercel | `DATABASE_URL` deve ser `postgresql://...`, não `file:./dev.db` |
