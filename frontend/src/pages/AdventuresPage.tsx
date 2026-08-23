import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchAdventures } from "../api/client";
import AdventureCard from "../components/AdventureCard";
import FilterBar from "../components/FilterBar";
import { CardSkeletonGrid } from "../components/Skeleton";
import { ErrorState } from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { filterFunction } from "../lib/filters";
import { readStoredFilters, saveFiltersToLocalStorage } from "../lib/storage";
import type { Filters } from "../types";

/** "new-york" reads better as "New York" in a heading. */
function titleCase(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AdventuresPage() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const cityLabel = city ? titleCase(city) : "this city";

  useDocumentTitle(city ? `Adventures in ${cityLabel}` : "Adventures");

  const {
    data: adventures,
    loading,
    error,
  } = useAsync(() => fetchAdventures(city), [city]);

  // Filters are restored from localStorage once, then persisted on every change.
  const [filters, setFilters] = useState<Filters>(readStoredFilters);

  const updateFilters = useCallback((next: Filters) => {
    setFilters(next);
    saveFiltersToLocalStorage(next);
  }, []);

  const visibleAdventures = useMemo(
    () => (adventures ? filterFunction(adventures, filters) : []),
    [adventures, filters]
  );

  const isFiltered = filters.duration !== "" || filters.category.length > 0;

  return (
    <div className="container">
      <div className="content">
        <h1 className="page-heading">Explore all adventures</h1>
        <p className="page-subheading">
          Here&rsquo;s a list of places you can explore in{" "}
          <span id="city-name">{cityLabel}</span>.
        </p>

        <FilterBar filters={filters} onChange={updateFilters} />

        {loading && <CardSkeletonGrid />}
        {error && <ErrorState message={error} />}

        {adventures && (
          <>
            {visibleAdventures.length > 0 && (
              <p className="filter-summary">
                Showing {visibleAdventures.length} of {adventures.length}{" "}
                adventures
                {isFiltered && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="filter-clear"
                      onClick={() =>
                        updateFilters({ duration: "", category: [] })
                      }
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </p>
            )}

            <div className="row mt-3" id="data">
              {visibleAdventures.map((adventure, index) => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  priority={index < 4}
                />
              ))}
            </div>

            {visibleAdventures.length === 0 && (
              <p className="empty-note">
                {adventures.length === 0 ? (
                  <>
                    We don&rsquo;t have adventures for this city yet.{" "}
                    <Link to="/">Browse other destinations</Link>
                  </>
                ) : (
                  <>
                    No adventures match these filters.{" "}
                    <button
                      type="button"
                      className="filter-clear"
                      onClick={() =>
                        updateFilters({ duration: "", category: [] })
                      }
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
