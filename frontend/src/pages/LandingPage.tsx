import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import CityTile from "../components/CityTile";
import { CardGridSkeleton, EmptyState, ErrorState } from "../components/ui/States";
import { useCities } from "../hooks/queries";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../api/client";

function Hero({
  query,
  onQueryChange,
  cityCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  cityCount?: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Aurora wash, dimmed so it tints the surface rather than shouting. */}
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-25 dark:opacity-20" />

      {/* Two slow-floating blobs give the backdrop life without a video. */}
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-brand-400/20 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-teal-400/20 blur-3xl animate-float"
        style={{ animationDelay: "-3.5s" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised/80 px-3 py-1 text-xs font-medium text-ink-soft backdrop-blur">
            <Sparkles className="size-3.5 text-brand-500" aria-hidden="true" />
            Handpicked trips across India and beyond
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-6xl">
            Find something worth
            <span className="bg-gradient-to-r from-brand-500 to-teal-500 bg-clip-text text-transparent">
              {" "}
              doing
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-ink-soft">
            Pick a city and see what you can actually do there — beaches, hill
            trails, night rides and everything in between.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-9 max-w-lg"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <label htmlFor="city-search" className="sr-only">
              Search for a city
            </label>
            <input
              id="city-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search for a city..."
              className="h-14 w-full rounded-2xl border border-line bg-surface-raised pl-12 pr-4 text-base text-ink shadow-card outline-none transition placeholder:text-ink-muted focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/15"
            />
          </div>

          {cityCount !== undefined && (
            <p className="mt-3 text-sm text-ink-muted">
              {cityCount} {cityCount === 1 ? "destination" : "destinations"} waiting
              to be explored
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { data: cities, isPending, error, refetch } = useCities();
  const [query, setQuery] = useState("");

  useDocumentTitle("Explore the world");

  const visibleCities = useMemo(() => {
    if (!cities) return [];
    const needle = query.trim().toLowerCase();
    if (needle === "") return cities;

    return cities.filter(
      (city) =>
        city.city.toLowerCase().includes(needle) ||
        city.description.toLowerCase().includes(needle) ||
        city.country?.toLowerCase().includes(needle)
    );
  }, [cities, query]);

  return (
    <>
      <Hero query={query} onQueryChange={setQuery} cityCount={cities?.length} />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Popular destinations
          </h2>
          <p className="mt-1 text-ink-soft">
            Pick a city to see what you can do there.
          </p>
        </div>

        {isPending && <CardGridSkeleton count={8} />}

        {error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "We could not load the destinations."
            }
            onRetry={() => void refetch()}
          />
        )}

        {cities && visibleCities.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCities.map((city, index) => (
              <CityTile
                key={city.id}
                city={city}
                index={index}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        {cities && visibleCities.length === 0 && (
          <EmptyState
            title={`No cities match “${query}”`}
            description="Try a different spelling, or clear the search to see everywhere we go."
          />
        )}
      </div>
    </>
  );
}
