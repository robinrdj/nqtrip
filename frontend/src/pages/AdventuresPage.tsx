import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import AdventureCard from "../components/AdventureCard";
import FilterPanel from "../components/FilterPanel";
import { Button } from "../components/ui/Button";
import { CardGridSkeleton, EmptyState, ErrorState } from "../components/ui/States";
import { useAdventures, useCities, useToggleWishlist } from "../hooks/queries";
import { useAdventureQuery } from "../hooks/useAdventureQuery";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth } from "../providers/AuthProvider";
import { cn } from "../lib/cn";
import { SORT_LABELS, SORT_OPTIONS, type SortOption } from "../types";

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Local state so typing stays responsive; the URL is written by the debounced
  // effect in the parent rather than on every keystroke.
  const [draft, setDraft] = useState(value);

  // Keep in step when the URL changes from elsewhere (Clear all, back button).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const debounced = useDebouncedValue(draft, 300);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // `value` is deliberately excluded: including it would re-fire this effect
    // when the URL catches up, undoing a keystroke typed in the meantime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <label htmlFor="adventure-search" className="sr-only">
        Search adventures
      </label>
      <input
        id="adventure-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search adventures..."
        className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-9 text-sm text-ink outline-none transition placeholder:text-ink-muted focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/15"
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-muted transition hover:bg-surface-inset hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export default function AdventuresPage() {
  const { query, update, clearFilters, activeFilterCount } = useAdventureQuery();
  const { data: cities } = useCities();
  const { isAuthenticated } = useAuth();
  const toggleWishlist = useToggleWishlist();

  const { data, isPending, isFetching, error, refetch } = useAdventures(query);

  const city = cities?.find((c) => c.id === query.city);
  useDocumentTitle(city ? `Adventures in ${city.city}` : "All adventures");

  const items = data?.items ?? [];
  const savedIds = new Set(data?.savedIds ?? []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {city ? city.city : "All adventures"}
        </h1>
        <p className="mt-1 text-ink-soft">
          {data
            ? `${data.total} ${data.total === 1 ? "adventure" : "adventures"} to choose from`
            : "Loading adventures..."}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={query.q} onChange={(q) => update({ q })} />

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={query.sort}
            onChange={(event) => update({ sort: event.target.value as SortOption })}
            className="h-11 rounded-xl border border-line bg-surface px-3 pr-8 text-sm text-ink outline-none transition focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/15"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <FilterPanel
          query={query}
          facets={data?.facets}
          update={update}
          activeFilterCount={activeFilterCount}
          clearFilters={clearFilters}
          resultCount={data?.total}
        />

        <div>
          {isPending && <CardGridSkeleton count={8} />}

          {error && (
            <ErrorState
              message={
                error instanceof ApiError
                  ? error.message
                  : "We could not load these adventures."
              }
              onRetry={() => void refetch()}
            />
          )}

          {data && items.length > 0 && (
            <>
              {/*
                While a new page or filter is loading, the previous results stay
                put and simply dim — the layout never collapses to skeletons
                once there is something to show.
              */}
              <div
                className={cn(
                  "grid grid-cols-1 gap-5 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3",
                  isFetching && "opacity-60"
                )}
              >
                {items.map((adventure, index) => (
                  <AdventureCard
                    key={adventure.id}
                    adventure={adventure}
                    saved={savedIds.has(adventure.id)}
                    onToggleSave={(id) => toggleWishlist.mutate(id)}
                    index={index}
                    priority={index < 3}
                  />
                ))}
              </div>

              {data.totalPages > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={query.page <= 1}
                    onClick={() => update({ page: query.page - 1 })}
                  >
                    Previous
                  </Button>

                  <span className="px-3 text-sm tabular-nums text-ink-soft">
                    Page {data.page} of {data.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={query.page >= data.totalPages}
                    onClick={() => update({ page: query.page + 1 })}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}

          {data && items.length === 0 && (
            <EmptyState
              title="Nothing matches those filters"
              description={
                activeFilterCount > 0
                  ? "Try widening the price or duration range, or clearing a category."
                  : "There is nothing listed here yet. Try another city."
              }
              action={
                activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/">Browse cities</Link>
                  </Button>
                )
              }
            />
          )}

          {!isAuthenticated && items.length > 0 && (
            <p className="mt-8 text-center text-sm text-ink-muted">
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Sign in
              </Link>{" "}
              to save adventures and book a spot.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
