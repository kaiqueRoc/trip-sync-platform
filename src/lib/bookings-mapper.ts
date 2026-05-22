import type { Booking } from "@prisma/client";
import type { BookingResponse } from "@trip-sync/contracts";

export function toBookingResponse(booking: Booking): BookingResponse {
  return {
    id: booking.id,
    reference: booking.reference,
    travelerName: booking.travelerName,
    destination: booking.destination,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    amountCents: booking.amountCents,
    currency: booking.currency,
    status: booking.status,
    providerId: booking.providerId,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BK-${suffix}`;
}
