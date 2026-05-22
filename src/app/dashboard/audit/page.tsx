import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  BOOKING_CREATED: "Reserva criada",
  BOOKING_STATUS_UPDATED: "Status atualizado",
  BOOKING_DELETED: "Reserva excluída",
  MEMBER_INVITED: "Membro convidado",
  SETTINGS_UPDATED: "Configurações",
  USER_LOGIN: "Login",
};

export default async function AuditPage() {
  const session = await auth();
  const logs = await prisma.auditLog.findMany({
    where: { organizationId: session!.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trilha de auditoria</h1>
        <p className="text-sm text-slate-500">
          Eventos registrados no tenant (isolamento por organizationId)
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum registro.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {log.createdAt.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 font-medium">
                  {ACTION_LABELS[log.action] ?? log.action}
                </td>
                <td className="px-4 py-3">
                  {log.entityType}
                  {log.entityId && (
                    <span className="ml-1 font-mono text-xs text-slate-400">
                      {log.entityId.slice(0, 8)}…
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{log.user?.email ?? "—"}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">
                  {log.metadata ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
