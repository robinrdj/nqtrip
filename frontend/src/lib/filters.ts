import type { Adventure, Filters } from "../types";

export const EMPTY_FILTERS: Filters = { duration: "", category: [] };

/** Keeps adventures whose duration falls within [low, high], inclusive. */
export function filterByDuration<T extends Pick<Adventure, "duration">>(
  list: T[],
  low: number | string,
  high: number | string
): T[] {
  const min = Number(low);
  const max = Number(high);
  return list.filter(
    (adventure) => adventure.duration >= min && adventure.duration <= max
  );
}

/** Keeps adventures belonging to any of the given categories. */
export function filterByCategory<T extends Pick<Adventure, "category">>(
  list: T[],
  categories: string[]
): T[] {
  return list.filter((adventure) => categories.includes(adventure.category));
}

/**
 * Applies whichever filters are set. An unset duration ("") or empty category
 * list is skipped, so no filters means the full list comes back.
 */
export function filterFunction<
  T extends Pick<Adventure, "duration" | "category">
>(list: T[], filters: Filters): T[] {
  let filtered = list;

  if (filters.category.length > 0) {
    filtered = filterByCategory(filtered, filters.category);
  }

  if (filters.duration !== "") {
    const [low, high] = filters.duration.split("-");
    filtered = filterByDuration(filtered, low, high);
  }

  return filtered;
}
