"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBooking } from "@/app/actions/bookings";

export function BookingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const checkInRaw = form.get("checkIn") as string;
    const checkOutRaw = form.get("checkOut") as string;

    const result = await createBooking({
      travelerName: form.get("travelerName"),
      destination: form.get("destination"),
      checkIn: new Date(checkInRaw).toISOString(),
      checkOut: new Date(checkOutRaw).toISOString(),
      amountCents: Number(form.get("amountCents")),
      currency: (form.get("currency") as string) || "BRL",
    });

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/dashboard/bookings");
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Nova reserva</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Viajante</label>
          <input name="travelerName" required minLength={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Destino</label>
          <input name="destination" required minLength={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input name="checkIn" type="date" required min={today} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input name="checkOut" type="date" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Valor (centavos)</label>
          <input name="amountCents" type="number" required min={1} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="245000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Moeda</label>
          <input name="currency" defaultValue="BRL" maxLength={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Criar reserva"}
        </button>
      </div>
    </form>
  );
}
