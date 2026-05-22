import { auth } from "@/auth";
import { BookingForm } from "@/components/booking-form";
import { canWriteBookings } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewBookingPage() {
  const session = await auth();
  if (!canWriteBookings(session!.role)) {
    redirect("/dashboard/bookings");
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/bookings"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Voltar às reservas
      </Link>
      <BookingForm />
    </div>
  );
}
