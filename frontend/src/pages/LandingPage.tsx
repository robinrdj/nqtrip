import { useMemo, useState } from "react";
import { fetchCities } from "../api/client";
import CityTile from "../components/CityTile";
import { TileSkeletonGrid } from "../components/Skeleton";
import { ErrorState } from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function LandingPage() {
  const { data: cities, loading, error } = useAsync(fetchCities, []);
  const [query, setQuery] = useState("");

  useDocumentTitle("Explore the world");

  const visibleCities = useMemo(() => {
    if (!cities) return [];
    const needle = query.trim().toLowerCase();
    if (needle === "") return cities;

    return cities.filter(
      (city) =>
        city.city.toLowerCase().includes(needle) ||
        city.description.toLowerCase().includes(needle)
    );
  }, [cities, query]);

  return (
    <>
      <section className="hero-image d-flex justify-content-center align-items-center flex-column text-center">
        <div className="container">
          <h1>Welcome to QTrip</h1>
          <p className="hero-subheading">
            Explore the world with fantastic places to venture around
          </p>

          <div className="hero-search">
            <label className="visually-hidden" htmlFor="city-search">
              Search a city
            </label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className="hero-input"
              id="city-search"
              type="search"
              placeholder="Search a City"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {cities && (
            <p className="hero-hint">
              {cities.length} destinations waiting to be explored
            </p>
          )}
        </div>
      </section>

      <div className="container">
        <div className="content">
          <h2 className="page-heading">Popular destinations</h2>
          <p className="page-subheading">
            Pick a city to see what you can do there.
          </p>

          {loading && <TileSkeletonGrid />}
          {error && <ErrorState message={error} />}

          {cities && (
            <>
              <div className="row" id="data">
                {visibleCities.map((city, index) => (
                  <CityTile key={city.id} city={city} priority={index < 4} />
                ))}
              </div>

              {visibleCities.length === 0 && (
                <p className="empty-note">
                  No cities match “{query}”. Try a different search.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
