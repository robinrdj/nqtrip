import { backendEndpoint } from "../config";
import type {
  Adventure,
  AdventureListResponse,
  AdventureQuery,
  City,
  Paged,
  Reservation,
  Review,
  ReviewListResponse,
  User,
} from "../types";

/**
 * Thrown for any failed request.
 *
 * `message` is written to be read by a person — pages surface it directly.
 * `fieldErrors` carries the API's per-field validation detail so a form can
 * attach server-side messages to the inputs that caused them.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      fieldErrors?: Record<string, string>;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "UNKNOWN";
    this.fieldErrors = options.fieldErrors ?? {};
    this.cause = options.cause;
  }

  /** The request failed because nobody is signed in. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { field: string; message: string }[];
  };
  message?: string;
}

async function readError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Not JSON, or empty — fall through to the status-based message.
  }

  const message =
    body?.error?.message ??
    body?.message ??
    `Request failed (${response.status})`;

  const fieldErrors: Record<string, string> = {};
  for (const detail of body?.error?.details ?? []) {
    // Keep the first message per field; forms show one at a time.
    fieldErrors[detail.field] ??= detail.message;
  }

  return new ApiError(message, {
    status: response.status,
    code: body?.error?.code ?? "REQUEST_ERROR",
    fieldErrors,
  });
}

/**
 * Refresh is shared across concurrent 401s.
 *
 * Without this, a page that fires four queries at once on an expired token
 * would send four refresh requests, and the last three would race against the
 * rotated cookie the first one just set.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${backendEndpoint}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      // Cleared on the next tick so callers awaiting this promise all observe
      // the same result before a new attempt can start.
      queueMicrotask(() => {
        refreshInFlight = null;
      });
    }
  })();

  return refreshInFlight;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  /** Internal: prevents a refreshed request from retrying forever. */
  retry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, retry = true } = options;

  let response: Response;

  try {
    response = await fetch(`${backendEndpoint}/api/v1${path}`, {
      method,
      signal,
      // Sends and accepts the httpOnly auth cookies.
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(
      "We could not reach the QTrip server. Check your connection and try again.",
      { cause: err }
    );
  }

  // An expired access token is recoverable: refresh once, then replay.
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refreshSession()) {
      return request<T>(path, { ...options, retry: false });
    }
  }

  if (!response.ok) throw await readError(response);

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch (err) {
    throw new ApiError("The server sent a response we could not read.", {
      cause: err,
    });
  }
}

/** Drops empty values so they never reach the URL as `&q=&priceMin=`. */
function toSearchParams(query: Partial<AdventureQuery>): string {
  const params = new URLSearchParams();

  if (query.city) params.set("city", query.city);
  if (query.q) params.set("q", query.q);
  if (query.category?.length) params.set("category", query.category.join(","));
  if (query.durationMin !== undefined) params.set("durationMin", String(query.durationMin));
  if (query.durationMax !== undefined) params.set("durationMax", String(query.durationMax));
  if (query.priceMin !== undefined) params.set("priceMin", String(query.priceMin));
  if (query.priceMax !== undefined) params.set("priceMax", String(query.priceMax));
  if (query.sort && query.sort !== "recommended") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));

  const serialised = params.toString();
  return serialised ? `?${serialised}` : "";
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                   */
/* -------------------------------------------------------------------------- */

export async function fetchCities(signal?: AbortSignal): Promise<City[]> {
  const { items } = await request<{ items: City[] }>("/cities", { signal });
  return items;
}

export function fetchAdventures(
  query: Partial<AdventureQuery>,
  signal?: AbortSignal
): Promise<AdventureListResponse> {
  return request<AdventureListResponse>(`/adventures${toSearchParams(query)}`, {
    signal,
  });
}

export function fetchAdventure(
  id: string,
  signal?: AbortSignal
): Promise<{ adventure: Adventure; saved: boolean }> {
  return request<{ adventure: Adventure; saved: boolean }>(
    `/adventures/${encodeURIComponent(id)}`,
    { signal }
  );
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

export function login(input: {
  email: string;
  password: string;
}): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/login", { method: "POST", body: input });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function logout(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/auth/logout", { method: "POST" });
}

export function fetchCurrentUser(signal?: AbortSignal): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/me", { signal });
}

export function updateProfile(input: { name: string }): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/me", { method: "PATCH", body: input });
}

/* -------------------------------------------------------------------------- */
/* Reservations                                                                */
/* -------------------------------------------------------------------------- */

export function fetchReservations(
  signal?: AbortSignal
): Promise<Paged<Reservation>> {
  return request<Paged<Reservation>>("/reservations?limit=50", { signal });
}

export function createReservation(input: {
  adventure: string;
  name: string;
  date: string;
  persons: number;
}): Promise<{ reservation: Reservation }> {
  return request<{ reservation: Reservation }>("/reservations", {
    method: "POST",
    body: input,
  });
}

export function cancelReservation(
  id: string
): Promise<{ reservation: Reservation }> {
  return request<{ reservation: Reservation }>(
    `/reservations/${encodeURIComponent(id)}/cancel`,
    { method: "POST" }
  );
}

/* -------------------------------------------------------------------------- */
/* Reviews and wishlist                                                        */
/* -------------------------------------------------------------------------- */

export function fetchReviews(
  adventureId: string,
  signal?: AbortSignal
): Promise<ReviewListResponse> {
  return request<ReviewListResponse>(
    `/adventures/${encodeURIComponent(adventureId)}/reviews?limit=20`,
    { signal }
  );
}

export function submitReview(
  adventureId: string,
  input: { rating: number; title?: string; body: string }
): Promise<{ review: Review }> {
  return request<{ review: Review }>(
    `/adventures/${encodeURIComponent(adventureId)}/reviews`,
    { method: "POST", body: input }
  );
}

export function deleteReview(reviewId: string): Promise<void> {
  return request<void>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
  });
}

export function fetchWishlist(signal?: AbortSignal): Promise<Adventure[]> {
  return request<{ items: Adventure[] }>("/wishlist", { signal }).then(
    (r) => r.items
  );
}

export function toggleWishlist(
  adventureId: string
): Promise<{ saved: boolean }> {
  return request<{ saved: boolean }>(
    `/wishlist/${encodeURIComponent(adventureId)}`,
    { method: "POST" }
  );
}
