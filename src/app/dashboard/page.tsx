import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canWriteBookings } from "@/lib/rbac";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session!.organizationId;

  const [total, pending, confirmed, cancelled, recentAudit] = await Promise.all([
    prisma.booking.count({ where: { organizationId: orgId } }),
    prisma.booking.count({ where: { organizationId: orgId, status: "PENDING" } }),
    prisma.booking.count({ where: { organizationId: orgId, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { organizationId: orgId, status: "CANCELLED" } }),
    prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const canWrite = canWriteBookings(session!.role);

  const stats = [
    { label: "Total", value: total },
    { label: "Pendentes", value: pending },
    { label: "Confirmadas", value: confirmed },
    { label: "Canceladas", value: cancelled },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
        <p className="text-sm text-slate-500">Reservas e atividade da sua organização</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/bookings"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver reservas
        </Link>
        {canWrite && (
          <Link
            href="/dashboard/bookings/new"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Nova reserva
          </Link>
        )}
        <Link
          href="/dashboard/audit"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Auditoria
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          Atividade recente
        </h2>
        <ul className="divide-y divide-slate-100">
          {recentAudit.length === 0 && (
            <li className="px-4 py-6 text-sm text-slate-500">Nenhum evento registrado.</li>
          )}
          {recentAudit.map((log) => (
            <li key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-slate-800">{log.action}</span>
              <span className="text-slate-500">
                {log.user?.email ?? "sistema"} · {log.createdAt.toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
