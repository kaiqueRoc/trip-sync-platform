import type { BookingResponse } from "@trip-sync/contracts";
import { auth } from "@/auth";
import { listBookings } from "@/app/actions/bookings";
import { BookingActions } from "@/components/booking-actions";
import { canWriteBookings } from "@/lib/rbac";
import Link from "next/link";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const result = await listBookings({
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
    status: params.status as "PENDING" | "CONFIRMED" | "CANCELLED" | undefined,
  });

  const canWrite = canWriteBookings(session!.role);
  const bookings: BookingResponse[] = result.ok ? result.data.data : [];
  const meta = result.ok ? result.data.meta : null;

  const statusFilters = [
    { value: "", label: "Todas" },
    { value: "PENDING", label: "Pendentes" },
    { value: "CONFIRMED", label: "Confirmadas" },
    { value: "CANCELLED", label: "Canceladas" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500">
            {meta ? `${meta.totalItems} reserva(s)` : "Carregando…"}
          </p>
        </div>
        {canWrite && (
          <Link
            href="/dashboard/bookings/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Nova reserva
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value || "all"}
            href={
              f.value
                ? `/dashboard/bookings?status=${f.value}`
                : "/dashboard/bookings"
            }
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              (params.status ?? "") === f.value
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Referência</th>
              <th className="px-4 py-3">Viajante</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma reserva encontrada.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs">{b.reference}</td>
                <td className="px-4 py-3">{b.travelerName}</td>
                <td className="px-4 py-3">{b.destination}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.status === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatMoney(b.amountCents, b.currency)}</td>
                <td className="px-4 py-3">
                  <BookingActions
                    bookingId={b.id}
                    status={b.status}
                    canWrite={canWrite}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex gap-2">
          {meta.hasPrev && (
            <Link
              href={`/dashboard/bookings?page=${meta.page - 1}${params.status ? `&status=${params.status}` : ""}`}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-white"
            >
              Anterior
            </Link>
          )}
          {meta.hasNext && (
            <Link
              href={`/dashboard/bookings?page=${meta.page + 1}${params.status ? `&status=${params.status}` : ""}`}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-white"
            >
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
