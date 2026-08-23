import type { Filters } from "../types";
import { EMPTY_FILTERS } from "./filters";

const FILTERS_KEY = "filters";

export function saveFiltersToLocalStorage(filters: Filters): boolean {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    return true;
  } catch {
    // Private browsing and full quotas both throw here; filters are a
    // convenience, so a failed write should not break the page.
    return false;
  }
}

export function getFiltersFromLocalStorage(): Filters | null {
  try {
    const stored = localStorage.getItem(FILTERS_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<Filters>;

    // Guard against hand-edited or stale values.
    return {
      duration: typeof parsed.duration === "string" ? parsed.duration : "",
      category: Array.isArray(parsed.category) ? parsed.category : [],
    };
  } catch {
    return null;
  }
}

export function readStoredFilters(): Filters {
  return getFiltersFromLocalStorage() ?? EMPTY_FILTERS;
}
