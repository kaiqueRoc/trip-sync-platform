"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBooking, updateBookingStatus } from "@/app/actions/bookings";
import type { BookingStatus } from "@trip-sync/contracts";

type Props = {
  bookingId: string;
  status: BookingStatus;
  canWrite: boolean;
};

export function BookingActions({ bookingId, status, canWrite }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!canWrite) return null;

  async function handleStatus(next: "CONFIRMED" | "CANCELLED") {
    setPending(true);
    const result = await updateBookingStatus(bookingId, { status: next });
    setPending(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Excluir esta reserva?")) return;
    setPending(true);
    const result = await deleteBooking(bookingId);
    setPending(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === "PENDING" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => handleStatus("CONFIRMED")}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Confirmar
        </button>
      )}
      {status !== "CANCELLED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => handleStatus("CANCELLED")}
          className="rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
        >
          Cancelar
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Excluir
      </button>
    </div>
  );
}
