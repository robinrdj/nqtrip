/**
 * The shapes the v1 API returns.
 *
 * Kept in step with the Mongoose models in the backend repo. Where the API
 * returns a wrapper (`{ items, page, total }`), that wrapper is modelled here
 * too rather than being unwrapped in the client, so paging information reaches
 * the components that need it.
 */

export const ADVENTURE_CATEGORIES = [
  "Beaches",
  "Cycling",
  "Hillside",
  "Party",
] as const;

export type AdventureCategory = (typeof ADVENTURE_CATEGORIES)[number];

export const SORT_OPTIONS = [
  "recommended",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
  "rating",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "duration-asc": "Duration: shortest",
  "duration-desc": "Duration: longest",
  rating: "Highest rated",
};

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  city: string;
  description: string;
  image: string;
  country?: string;
  adventureCount: number;
  location?: GeoPoint;
}

export interface Adventure {
  id: string;
  city: string;
  name: string;
  subtitle: string;
  content: string;
  image: string;
  images: string[];
  category: AdventureCategory;
  /** Hours. */
  duration: number;
  costPerHead: number;
  currency: string;
  capacity: number;
  booked: number;
  seatsLeft: number;
  /** Legacy alias for `seatsLeft > 0`. */
  available: boolean;
  ratingAverage: number;
  ratingCount: number;
  /** Illustrative pin near the city centre; absent on un-reseeded data. */
  location?: GeoPoint;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
}

export interface Reservation {
  id: string;
  adventure: string;
  adventureName: string;
  city?: string;
  name: string;
  /** ISO datetime; the calendar day is the meaningful part. */
  date: string;
  persons: number;
  price: number;
  status: "confirmed" | "cancelled";
  cancelledAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  adventure: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

/** Every paged endpoint answers with this envelope. */
export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdventureFacets {
  categories: { value: AdventureCategory; count: number }[];
  priceRange: { min: number; max: number } | null;
}

export interface AdventureListResponse extends Paged<Adventure> {
  facets: AdventureFacets;
  /** Ids the signed-in visitor has saved, so hearts paint on first render. */
  savedIds: string[];
}

export interface ReviewListResponse extends Paged<Review> {
  /** Always five keys, so a histogram needs no gap-filling. */
  distribution: Record<string, number>;
}

/**
 * The filter state for the adventures page.
 *
 * Mirrors the query the API accepts, and is serialised straight into the URL —
 * so a filtered view is shareable and survives a reload without localStorage.
 */
export interface AdventureQuery {
  city: string;
  q: string;
  category: AdventureCategory[];
  durationMin?: number;
  durationMax?: number;
  priceMin?: number;
  priceMax?: number;
  sort: SortOption;
  page: number;
}

/* -------------------------------------------------------------------------- */
/* Weather, tickets and sign-in providers                                      */
/* -------------------------------------------------------------------------- */

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

/** A day's forecast, or why there is none. Never an error: weather is optional. */
export type Forecast =
  | {
      available: true;
      date: string;
      condition: WeatherCondition;
      summary: string;
      tempMax: number;
      tempMin: number;
      precipitationChance: number | null;
    }
  | {
      available: false;
      date: string;
      reason: "out-of-range" | "no-location" | "unavailable";
    };

/** What the public verify page learns from a scanned QR code. */
export type TicketCheck =
  | {
      valid: true;
      reference: string;
      status: "confirmed" | "cancelled";
      adventureName: string;
      city?: string;
      date: string;
      persons: number;
      /** First name and initial only. */
      guest: string;
    }
  | { valid: false };

export interface AuthProviders {
  password: boolean;
  google: { enabled: true; clientId: string } | { enabled: false };
}

/** Pushed over the live stream for an adventure. */
export interface SeatUpdate {
  adventureId: string;
  capacity: number;
  booked: number;
  seatsLeft: number;
}
