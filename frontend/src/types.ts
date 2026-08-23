export interface City {
  id: string;
  city: string;
  description: string;
  image: string;
}

export interface Adventure {
  id: string;
  name: string;
  costPerHead: number;
  currency: string;
  image: string;
  duration: number;
  category: string;
}

/**
 * What `/adventures/detail` actually returns. Note this is NOT an Adventure:
 * the detail records carry no `duration`, `category`, `currency` or `image`
 * field, so anything needing those must read them from the list endpoint.
 *
 * `images` can contain nulls in the seed data.
 */
export interface AdventureDetail {
  id: string;
  name: string;
  subtitle: string;
  images: (string | null)[];
  content: string;
  available: boolean;
  reserved: boolean;
  costPerHead: number;
}

export interface Reservation {
  id: string;
  name: string;
  date: string;
  person: string;
  adventure: string;
  adventureName: string;
  price: number;
  time: string;
}

export interface ReservationRequest {
  name: string;
  date: string;
  person: string;
  adventure: string;
}

/** Duration is a single range like "2-6"; category is multi-select. */
export interface Filters {
  duration: string;
  category: string[];
}
