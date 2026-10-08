import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ADVENTURE_CATEGORIES,
  SORT_OPTIONS,
  type AdventureCategory,
  type AdventureQuery,
  type SortOption,
} from "../types";

/**
 * Filter state, held in the URL rather than in component state.
 *
 * This replaces the old localStorage persistence. The URL is a better home for
 * it: a filtered view becomes a shareable link, back and forward move through
 * filter changes the way people expect, and a reload restores exactly what was
 * on screen — none of which localStorage gave us.
 */

function readNumber(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function readCategories(params: URLSearchParams): AdventureCategory[] {
  const raw = params.get("category");
  if (!raw) return [];

  const allowed = new Set<string>(ADVENTURE_CATEGORIES);
  // Filtering against the allow-list keeps a hand-edited URL from sending
  // values the API would reject with a 400.
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is AdventureCategory => allowed.has(value));
}

function readSort(params: URLSearchParams): SortOption {
  const raw = params.get("sort");
  return (SORT_OPTIONS as readonly string[]).includes(raw ?? "")
    ? (raw as SortOption)
    : "recommended";
}

/**
 * The grid/map toggle lives in the URL too, but it is presentation rather than
 * filtering: it is not part of the API query (so switching views does not
 * refetch), and it survives filter changes and "Clear all".
 */
function keepViewMode(from: URLSearchParams, to: URLSearchParams): void {
  const view = from.get("view");
  if (view) to.set("view", view);
}

export interface UseAdventureQueryResult {
  query: AdventureQuery;
  /** Merges a partial change, resetting to page 1 unless the page is what changed. */
  update: (patch: Partial<AdventureQuery>) => void;
  clearFilters: () => void;
  /** True when anything beyond the city is narrowing the results. */
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useAdventureQuery(): UseAdventureQueryResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo<AdventureQuery>(
    () => ({
      city: searchParams.get("city") ?? "",
      q: searchParams.get("q") ?? "",
      category: readCategories(searchParams),
      durationMin: readNumber(searchParams, "durationMin"),
      durationMax: readNumber(searchParams, "durationMax"),
      priceMin: readNumber(searchParams, "priceMin"),
      priceMax: readNumber(searchParams, "priceMax"),
      sort: readSort(searchParams),
      page: readNumber(searchParams, "page") ?? 1,
    }),
    [searchParams]
  );

  const update = useCallback(
    (patch: Partial<AdventureQuery>) => {
      const next = { ...query, ...patch };

      // Any change other than paging invalidates the current page number —
      // otherwise narrowing a filter can strand the visitor on an empty page 3.
      if (patch.page === undefined) next.page = 1;

      const params = new URLSearchParams();
      if (next.city) params.set("city", next.city);
      if (next.q) params.set("q", next.q);
      if (next.category.length) params.set("category", next.category.join(","));
      if (next.durationMin !== undefined) params.set("durationMin", String(next.durationMin));
      if (next.durationMax !== undefined) params.set("durationMax", String(next.durationMax));
      if (next.priceMin !== undefined) params.set("priceMin", String(next.priceMin));
      if (next.priceMax !== undefined) params.set("priceMax", String(next.priceMax));
      if (next.sort !== "recommended") params.set("sort", next.sort);
      if (next.page > 1) params.set("page", String(next.page));
      keepViewMode(searchParams, params);

      // `replace` so typing in the search box does not push a history entry per
      // keystroke; the back button should leave the page, not undo a letter.
      setSearchParams(params, { replace: true });
    },
    [query, searchParams, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (query.city) params.set("city", query.city);
    keepViewMode(searchParams, params);
    setSearchParams(params, { replace: true });
  }, [query.city, searchParams, setSearchParams]);

  const activeFilterCount =
    (query.q ? 1 : 0) +
    query.category.length +
    (query.durationMin !== undefined || query.durationMax !== undefined ? 1 : 0) +
    (query.priceMin !== undefined || query.priceMax !== undefined ? 1 : 0);

  return {
    query,
    update,
    clearFilters,
    hasActiveFilters: activeFilterCount > 0,
    activeFilterCount,
  };
}
