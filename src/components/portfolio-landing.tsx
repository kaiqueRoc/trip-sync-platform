import Link from "next/link";

const REPOS = [
  {
    name: "trip-sync-contracts",
    role: "Contratos compartilhados",
    description: "Zod, tipos TypeScript e OpenAPI 3.1 — fonte única de validação.",
    href: "https://github.com/kaiqueRoc/trip-sync-contracts",
    tags: ["Zod", "OpenAPI", "CI drift-check"],
  },
  {
    name: "trip-sync-api",
    role: "Backend REST",
    description: "Fastify, Prisma, webhooks, sync jobs e documentação em /docs.",
    href: "https://github.com/kaiqueRoc/trip-sync-api",
    tags: ["Fastify", "Idempotência", "Swagger"],
  },
  {
    name: "trip-sync-ops",
    role: "Console operacional",
    description: "React 19 + Vite, TanStack Query e MSW para integrações B2B.",
    href: "https://github.com/kaiqueRoc/trip-sync-ops",
    tags: ["React", "MSW", "OpenAPI types"],
  },
  {
    name: "trip-sync-platform",
    role: "Plataforma full-stack",
    description: "Next.js 15, multi-tenant, RBAC, auditoria e Server Actions.",
    href: "https://github.com/kaiqueRoc/trip-sync-platform",
    tags: ["Next.js", "NextAuth", "Prisma"],
    highlight: true,
  },
] as const;

const HIGHLIGHTS = [
  "Isolamento multi-tenant por organização (ADR documentado)",
  "RBAC: OWNER, OPERATOR e VIEWER",
  "Validação schema-first com @trip-sync/contracts",
  "Trilha de auditoria por tenant",
  "CI em GitHub Actions em todos os repositórios",
];

export function PortfolioLanding() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-brand-900">TripSync</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/kaiqueRoc"
              className="text-sm font-medium text-slate-600 hover:text-brand-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Entrar na demo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Portfólio técnico · Kaique Rocha
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Ecossistema TripSync
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Plataforma B2B de reservas para agências de viagem — quatro repositórios
            integrados, do contrato OpenAPI ao dashboard multi-tenant.
          </p>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {REPOS.map((repo) => (
            <a
              key={repo.name}
              href={repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl border bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md ${
                "highlight" in repo && repo.highlight
                  ? "border-brand-400 ring-1 ring-brand-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-brand-600">
                    {repo.role}
                  </p>
                  <h2 className="mt-1 font-mono text-sm font-bold text-slate-900">
                    {repo.name}
                  </h2>
                </div>
                <span className="text-slate-400" aria-hidden>
                  ↗
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{repo.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {repo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </section>

        <section className="mt-14 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Destaques de engenharia</h2>
          <ul className="mt-4 space-y-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="text-brand-600" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Demo interativa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Esta aplicação (trip-sync-platform) roda com dados seed. Use as credenciais
              abaixo para explorar dashboard, reservas e auditoria.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-500">OWNER</dt>
                <dd className="font-mono text-slate-800">owner@demo.tripsync</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-500">Senha</dt>
                <dd className="font-mono text-slate-800">Demo@2025</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Reserva seed</dt>
                <dd className="font-mono text-slate-800">BK-DEMO0001</dd>
              </div>
            </dl>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Acessar dashboard
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Stack correlata</h2>
            <p className="mt-2 text-sm text-slate-600">
              API em{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">localhost:3333</code>{" "}
              (docs em /docs) e console ops em{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">localhost:5173</code>{" "}
              — clones irmãos no mesmo diretório pai.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Preview online (GitHub Pages):{" "}
              <a
                href="https://kaiqueroc.github.io/trip-sync-platform/"
                className="font-semibold text-brand-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                kaiqueroc.github.io/trip-sync-platform
              </a>
            </p>
            <a
              href="https://github.com/kaiqueRoc/trip-sync-platform/blob/main/docs/DEPLOY.md"
              className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Como publicar (Pages + Vercel) →
            </a>
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-slate-400">
          Projeto de portfólio — MIT. Não é produto comercial em produção.
        </p>
      </main>
    </div>
  );
}
