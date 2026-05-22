"use server";

import {
  BookingListQuerySchema,
  CreateBookingInputSchema,
  UpdateBookingStatusInputSchema,
} from "@trip-sync/contracts";
import type { BookingListResponse, BookingResponse } from "@trip-sync/contracts";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { generateReference, toBookingResponse } from "@/lib/bookings-mapper";
import { prisma } from "@/lib/prisma";
import { canWriteBookings } from "@/lib/rbac";
import { requireSession } from "@/lib/tenant";
import { actionError, type ActionResult } from "@/lib/action-result";

function formatZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function listBookings(
  query: unknown,
): Promise<ActionResult<BookingListResponse>> {
  try {
    const ctx = await requireSession();
    const parsed = BookingListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return actionError("Parâmetros inválidos", formatZodErrors(parsed.error));
    }

    const { page, pageSize, status, destination, providerId } = parsed.data;
    const where = {
      organizationId: ctx.organizationId,
      ...(status ? { status } : {}),
      ...(providerId ? { providerId } : {}),
      ...(destination
        ? { destination: { contains: destination } }
        : {}),
    };

    const [totalItems, rows] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize) || 0;

    return {
      ok: true,
      data: {
        data: rows.map(toBookingResponse),
        meta: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch {
    return actionError("Não autorizado");
  }
}

export async function createBooking(
  input: unknown,
): Promise<ActionResult<BookingResponse>> {
  try {
    const ctx = await requireSession();
    if (!canWriteBookings(ctx.role)) {
      return actionError("Permissão insuficiente");
    }

    const parsed = CreateBookingInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Dados inválidos", formatZodErrors(parsed.error));
    }

    const data = parsed.data;
    let reference = generateReference();
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await prisma.booking.findUnique({
        where: {
          organizationId_reference: {
            organizationId: ctx.organizationId,
            reference,
          },
        },
      });
      if (!exists) break;
      reference = generateReference();
    }

    const booking = await prisma.booking.create({
      data: {
        organizationId: ctx.organizationId,
        reference,
        travelerName: data.travelerName,
        destination: data.destination,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        amountCents: data.amountCents,
        currency: data.currency ?? "BRL",
        providerId: data.providerId ?? null,
        status: "PENDING",
      },
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: "BOOKING_CREATED",
      entityType: "Booking",
      entityId: booking.id,
      metadata: { reference: booking.reference },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");

    return { ok: true, data: toBookingResponse(booking) };
  } catch {
    return actionError("Não autorizado");
  }
}

export async function updateBookingStatus(
  bookingId: string,
  input: unknown,
): Promise<ActionResult<BookingResponse>> {
  try {
    const ctx = await requireSession();
    if (!canWriteBookings(ctx.role)) {
      return actionError("Permissão insuficiente");
    }

    const parsed = UpdateBookingStatusInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Dados inválidos", formatZodErrors(parsed.error));
    }

    const existing = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId: ctx.organizationId },
    });
    if (!existing) {
      return actionError("Reserva não encontrada");
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: parsed.data.status },
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: "BOOKING_STATUS_UPDATED",
      entityType: "Booking",
      entityId: booking.id,
      metadata: {
        from: existing.status,
        to: parsed.data.status,
        reason: parsed.data.reason,
      },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");

    return { ok: true, data: toBookingResponse(booking) };
  } catch {
    return actionError("Não autorizado");
  }
}

export async function deleteBooking(
  bookingId: string,
): Promise<ActionResult> {
  try {
    const ctx = await requireSession();
    if (!canWriteBookings(ctx.role)) {
      return actionError("Permissão insuficiente");
    }

    const existing = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId: ctx.organizationId },
    });
    if (!existing) {
      return actionError("Reserva não encontrada");
    }

    await prisma.booking.delete({ where: { id: bookingId } });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: "BOOKING_DELETED",
      entityType: "Booking",
      entityId: bookingId,
      metadata: { reference: existing.reference },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");

    return { ok: true, data: undefined };
  } catch {
    return actionError("Não autorizado");
  }
}
