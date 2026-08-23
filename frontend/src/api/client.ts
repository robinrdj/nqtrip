import { backendEndpoint } from "../config";
import type {
  Adventure,
  AdventureDetail,
  City,
  Reservation,
  ReservationRequest,
} from "../types";

/**
 * Thrown for any failed request. Pages surface `message` to the user, so it is
 * written to be read by a person rather than logged.
 */
export class ApiError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/** Pulls the API's human-readable explanation out of an error response. */
async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string" &&
      body.message.trim() !== ""
    ) {
      return body.message;
    }
  } catch {
    // Not JSON, or an empty body - fall back to the status code.
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${backendEndpoint}${path}`, init);
  } catch (err) {
    throw new ApiError(
      "Could not reach the QTrip server. Is the backend running?",
      err
    );
  }

  if (!response.ok) {
    // The API explains rejections in a `message` field (e.g. booking a past
    // date). Prefer that over a bare status code.
    throw new ApiError(
      (await readErrorMessage(response)) ??
        `Request failed (${response.status})`
    );
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    throw new ApiError("The server sent a response we could not read.", err);
  }
}

export function fetchCities(): Promise<City[]> {
  return request<City[]>("/cities");
}

export function fetchAdventures(city: string): Promise<Adventure[]> {
  return request<Adventure[]>(`/adventures?city=${encodeURIComponent(city)}`);
}

export function fetchAdventureDetail(
  adventureId: string
): Promise<AdventureDetail> {
  return request<AdventureDetail>(
    `/adventures/detail?adventure=${encodeURIComponent(adventureId)}`
  );
}

export function fetchReservations(): Promise<Reservation[]> {
  return request<Reservation[]>("/reservations");
}

export function createReservation(
  reservation: ReservationRequest
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/reservations/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
  });
}
