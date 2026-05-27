import {
  BookingListResponseSchema,
  BookingResponseSchema,
  type BookingListQuery,
  type BookingListResponse,
  type BookingResponse,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
} from "@trip-sync/contracts";
import type { SessionContext } from "@/lib/tenant";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  idempotencyKey?: string;
};

export function isTripSyncApiConfigured() {
  return Boolean(process.env.TRIPSYNC_API_URL);
}

function getApiBaseUrl() {
  const value = process.env.TRIPSYNC_API_URL;
  if (!value) {
    throw new Error("TRIPSYNC_API_URL is not configured");
  }
  return value.replace(/\/$/, "");
}

function buildHeaders(ctx: SessionContext, options?: ApiRequestOptions) {
  const headers = new Headers({
    "content-type": "application/json",
    "x-tripsync-user-id": ctx.userId,
    "x-tripsync-organization-id": ctx.organizationId,
    "x-tripsync-user-role": ctx.role,
  });

  if (ctx.email) {
    headers.set("x-tripsync-user-email", ctx.email);
  }

  if (process.env.TRIPSYNC_API_TOKEN) {
    headers.set("authorization", `Bearer ${process.env.TRIPSYNC_API_TOKEN}`);
  }

  if (options?.idempotencyKey) {
    headers.set("idempotency-key", options.idempotencyKey);
  }

  return headers;
}

async function requestApi<T>(
  ctx: SessionContext,
  path: string,
  options: ApiRequestOptions,
  parse: (payload: unknown) => T,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(ctx, options),
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "TripSync API request failed";
    throw new Error(message);
  }

  return parse(payload);
}

export async function listApiBookings(
  ctx: SessionContext,
  query: BookingListQuery,
): Promise<BookingListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  if (query.status) params.set("status", query.status);
  if (query.destination) params.set("destination", query.destination);
  if (query.providerId) params.set("providerId", query.providerId);

  return requestApi(ctx, `/bookings?${params}`, {}, (payload) =>
    BookingListResponseSchema.parse(payload),
  );
}

export async function createApiBooking(
  ctx: SessionContext,
  input: CreateBookingInput,
): Promise<BookingResponse> {
  return requestApi(
    ctx,
    "/bookings",
    {
      method: "POST",
      body: input,
      idempotencyKey: `${ctx.organizationId}:${ctx.userId}:${Date.now()}`,
    },
    (payload) => BookingResponseSchema.parse(payload),
  );
}

export async function updateApiBookingStatus(
  ctx: SessionContext,
  bookingId: string,
  input: UpdateBookingStatusInput,
): Promise<BookingResponse> {
  return requestApi(
    ctx,
    `/bookings/${bookingId}/status`,
    {
      method: "PATCH",
      body: input,
    },
    (payload) => BookingResponseSchema.parse(payload),
  );
}
