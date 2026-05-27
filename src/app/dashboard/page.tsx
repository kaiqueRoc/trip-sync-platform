import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canWriteBookings } from "@/lib/rbac";
import {
  isTripSyncApiConfigured,
  listApiBookings,
} from "@/lib/tripsync-api";
import type { SessionContext } from "@/lib/tenant";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const statusLabel = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
} as const;

const statusClass = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
} as const;

export default async function DashboardPage() {
  const session = await auth();
  const ctx: SessionContext = {
    userId: session!.user.id,
    organizationId: session!.organizationId,
    role: session!.role,
    email: session!.user.email ?? "",
    name: session!.user.name ?? null,
  };
  const orgId = ctx.organizationId;

  const [bookingList, pendingList, confirmedList, cancelledList, recentAudit] =
    await Promise.all([
      isTripSyncApiConfigured()
        ? listApiBookings(ctx, { page: 1, pageSize: 5 })
        : prisma.booking
            .findMany({
              where: { organizationId: orgId },
              orderBy: { createdAt: "desc" },
              take: 5,
            })
            .then((rows) => ({
              data: rows.map((booking) => ({
                ...booking,
                checkIn: booking.checkIn.toISOString(),
                checkOut: booking.checkOut.toISOString(),
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString(),
              })),
              meta: {
                page: 1,
                pageSize: 5,
                totalItems: rows.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            })),
      isTripSyncApiConfigured()
        ? listApiBookings(ctx, { page: 1, pageSize: 1, status: "PENDING" })
        : prisma.booking
            .count({ where: { organizationId: orgId, status: "PENDING" } })
            .then((count) => ({ meta: { totalItems: count } })),
      isTripSyncApiConfigured()
        ? listApiBookings(ctx, { page: 1, pageSize: 1, status: "CONFIRMED" })
        : prisma.booking
            .count({ where: { organizationId: orgId, status: "CONFIRMED" } })
            .then((count) => ({ meta: { totalItems: count } })),
      isTripSyncApiConfigured()
        ? listApiBookings(ctx, { page: 1, pageSize: 1, status: "CANCELLED" })
        : prisma.booking
            .count({ where: { organizationId: orgId, status: "CANCELLED" } })
            .then((count) => ({ meta: { totalItems: count } })),
      prisma.auditLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { email: true } } },
      }),
    ]);

  const total = bookingList.meta.totalItems;
  const pending = pendingList.meta.totalItems;
  const confirmed = confirmedList.meta.totalItems;
  const cancelled = cancelledList.meta.totalItems;
  const recentBookings = bookingList.data;

  const canWrite = canWriteBookings(session!.role);

  const stats = [
    {
      label: "Total",
      value: total,
      helper: "+12,5% vs período anterior",
      icon: "T",
      tone: "bg-teal-50 text-teal-700",
    },
    {
      label: "Pendentes",
      value: pending,
      helper: "+8,2% aguardando ação",
      icon: "P",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Confirmadas",
      value: confirmed,
      helper: "+15,7% receita protegida",
      icon: "C",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Canceladas",
      value: cancelled,
      helper: "-5,3% no período",
      icon: "X",
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Olá, {session?.user?.name ?? "Agência Demo"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bem-vindo ao painel da sua agência de viagens.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          01/05/2024 - 31/05/2024
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {s.value.toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${s.tone}`}
              >
                {s.icon}
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">{s.helper}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Reservas recentes</h2>
            <p className="mt-1 text-xs text-slate-500">
              Acompanhe as últimas viagens cadastradas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite && (
              <Link
                href="/dashboard/bookings/new"
                className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                Nova reserva
              </Link>
            )}
            <Link
              href="/dashboard/bookings"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver todas as reservas
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Código da reserva</th>
                <th className="px-5 py-3">Produto</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Data da viagem</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Nenhuma reserva cadastrada.
                  </td>
                </tr>
              )}
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">
                    {booking.reference}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    Pacote - {booking.destination}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{booking.travelerName}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(new Date(booking.checkIn))}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass[booking.status]}`}
                    >
                      {statusLabel[booking.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">
                    {formatMoney(booking.amountCents, booking.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Atividade recente</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {recentAudit.length === 0 && (
              <li className="py-4 text-sm text-slate-500">Nenhum evento registrado.</li>
            )}
            {recentAudit.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="font-medium text-slate-800">{log.action}</span>
                <span className="text-right text-xs text-slate-500">
                  {log.user?.email ?? "sistema"} - {log.createdAt.toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-teal-600 p-5 text-white shadow-sm">
          <p className="text-sm font-semibold">Operação multi-tenant</p>
          <p className="mt-3 text-3xl font-bold">{session!.role}</p>
          <p className="mt-3 text-sm text-teal-50">
            RBAC, trilha de auditoria e isolamento por organização ativos para a demo.
          </p>
          <Link
            href="/dashboard/audit"
            className="mt-5 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
          >
            Ver auditoria
          </Link>
        </div>
      </section>
    </div>
  );
}
