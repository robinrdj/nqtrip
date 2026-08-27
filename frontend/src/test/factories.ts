import type {
  Adventure,
  AdventureListResponse,
  City,
  Reservation,
  Review,
  User,
} from "../types";

/**
 * Fixture builders.
 *
 * Every field has a sensible default so a test only states what it actually
 * cares about — a card test that is about the sold-out badge should not have to
 * invent a rating and a subtitle to compile.
 */

export function makeAdventure(overrides: Partial<Adventure> = {}): Adventure {
  return {
    id: "adv-1",
    city: "goa",
    name: "Sunset Kayaking",
    subtitle: "Paddle out at golden hour",
    content: "A long description of the adventure.",
    image: "https://images.pexels.com/photos/1/kayak.jpeg",
    images: ["https://images.pexels.com/photos/1/kayak.jpeg"],
    category: "Beaches",
    duration: 4,
    costPerHead: 1200,
    currency: "INR",
    capacity: 10,
    booked: 0,
    seatsLeft: 10,
    available: true,
    ratingAverage: 4.5,
    ratingCount: 12,
    ...overrides,
  };
}

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: "goa",
    city: "Goa",
    description: "250+ Places",
    image: "https://images.pexels.com/photos/2/goa.jpeg",
    adventureCount: 11,
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Robin Rajadurai",
    email: "robin@example.com",
    role: "user",
    ...overrides,
  };
}

export function makeReservation(
  overrides: Partial<Reservation> = {}
): Reservation {
  return {
    id: "res-1",
    adventure: "adv-1",
    adventureName: "Sunset Kayaking",
    city: "goa",
    name: "Robin Rajadurai",
    date: "2099-01-15T00:00:00.000Z",
    persons: 2,
    price: 2400,
    status: "confirmed",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "rev-1",
    adventure: "adv-1",
    user: { id: "user-1", name: "Robin Rajadurai" },
    rating: 5,
    title: "Superb",
    body: "Genuinely worth the early start.",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeAdventureList(
  items: Adventure[] = [makeAdventure()],
  overrides: Partial<AdventureListResponse> = {}
): AdventureListResponse {
  return {
    items,
    page: 1,
    limit: 24,
    total: items.length,
    totalPages: 1,
    facets: {
      categories: [
        { value: "Beaches", count: 2 },
        { value: "Cycling", count: 1 },
        { value: "Hillside", count: 0 },
        { value: "Party", count: 3 },
      ],
      priceRange: { min: 500, max: 5000 },
    },
    savedIds: [],
    ...overrides,
  };
}
