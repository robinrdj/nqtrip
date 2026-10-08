import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { formatCurrency } from "../../lib/format";
import { useTheme } from "../../providers/ThemeProvider";
import type { Adventure, GeoPoint } from "../../types";

/**
 * Leaflet map of adventures, with price pins.
 *
 * This module is only ever imported lazily (see LazyAdventureMap): Leaflet and
 * its stylesheet are ~150KB that a visitor who never opens the map should not
 * download.
 *
 * Tiles are OpenStreetMap's own: keyless, and fine for a site of this size
 * under OSM's tile policy (attribution shown, no bulk downloading). For heavy
 * traffic, swap TILE_URL for a commercial provider. OSM has no dark style, so
 * dark mode inverts the tiles with a CSS filter rather than glaring white.
 */

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Inverting alone turns water orange; rotating the hue back keeps it blue.
const DARK_TILES = "invert hue-rotate-180 brightness-95 contrast-90";

/**
 * A price pill rather than Leaflet's default marker. The default is an image
 * whose URL bundlers mangle, and a price says more than a pin does anyway.
 * The classes are Tailwind's, picked up from this file by the scanner.
 */
function pricePin(adventure: Adventure, active: boolean): L.DivIcon {
  const soldOut = adventure.seatsLeft <= 0;
  return L.divIcon({
    className: "",
    html: `<span class="${cn(
      "inline-flex -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform",
      active
        ? "scale-110 border-brand-700 bg-brand-600 text-white"
        : soldOut
          ? "border-line bg-surface-inset text-ink-muted line-through"
          : "border-line bg-surface-raised text-ink hover:scale-110"
    )}">${formatCurrency(adventure.costPerHead)}</span>`,
    iconSize: [0, 0],
  });
}

/** Frames every pin, and re-frames when the set of pins changes. */
function FitToPins({ points, fallback }: { points: GeoPoint[]; fallback?: GeoPoint }) {
  const map = useMap();
  // A string key, so an identical re-render does not yank the viewport back.
  const signature = points.map((p) => `${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
        padding: [48, 48],
        maxZoom: 14,
      });
    } else if (points.length === 1) {
      map.setView([points[0]!.lat, points[0]!.lng], 13);
    } else if (fallback) {
      map.setView([fallback.lat, fallback.lng], 11);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  return null;
}

export interface AdventureMapProps {
  adventures: Adventure[];
  /** Where to look when there are no pins (an empty filter result). */
  fallbackCenter?: GeoPoint;
  /** Highlights one pin, e.g. the adventure a detail page is about. */
  activeId?: string;
  /** Hide the popups when the page around the map already says everything. */
  popups?: boolean;
  className?: string;
}

export default function AdventureMap({
  adventures,
  fallbackCenter,
  activeId,
  popups = true,
  className,
}: AdventureMapProps) {
  const { resolved } = useTheme();

  const pinned = useMemo(
    () => adventures.filter((a): a is Adventure & { location: GeoPoint } => Boolean(a.location)),
    [adventures]
  );

  const start = pinned[0]?.location ?? fallbackCenter ?? { lat: 20, lng: 78 };

  return (
    <MapContainer
      center={[start.lat, start.lng]}
      zoom={12}
      // Scroll-to-zoom hijacks the page scroll when the cursor crosses the map.
      scrollWheelZoom={false}
      className={cn("z-0 overflow-hidden rounded-panel border border-line", className)}
    >
      <TileLayer
        // Keyed by theme: Leaflet reads className only when the layer is created.
        key={resolved}
        url={TILE_URL}
        attribution={ATTRIBUTION}
        maxZoom={19}
        className={resolved === "dark" ? DARK_TILES : undefined}
      />

      <FitToPins points={pinned.map((a) => a.location)} fallback={fallbackCenter} />

      {pinned.map((adventure) => (
        <Marker
          key={adventure.id}
          position={[adventure.location.lat, adventure.location.lng]}
          icon={pricePin(adventure, adventure.id === activeId)}
          title={adventure.name}
          alt={adventure.name}
          zIndexOffset={adventure.id === activeId ? 1000 : 0}
        >
          {popups && (
            <Popup>
              <Link to={`/adventures/${adventure.id}`} className="block w-52 text-inherit no-underline">
                <img
                  src={adventure.image}
                  alt=""
                  loading="lazy"
                  className="mb-2 aspect-[4/3] w-full rounded-lg object-cover"
                />
                <span className="block font-semibold text-slate-900">{adventure.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {adventure.category} · {adventure.duration}h ·{" "}
                  {adventure.seatsLeft > 0 ? `${adventure.seatsLeft} seats left` : "Sold out"}
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-900">
                  {formatCurrency(adventure.costPerHead)}
                  <span className="font-normal text-slate-500"> / person</span>
                </span>
              </Link>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
