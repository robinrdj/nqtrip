import { Suspense, lazy } from "react";
import { cn } from "../../lib/cn";
import { Skeleton } from "../ui/States";
import type { AdventureMapProps } from "./AdventureMap";

const AdventureMap = lazy(() => import("./AdventureMap"));

/**
 * The map, loaded on first use.
 *
 * The placeholder takes the map's exact box, so nothing below it moves when
 * Leaflet arrives.
 */
export default function LazyAdventureMap(props: AdventureMapProps) {
  return (
    <Suspense
      fallback={<Skeleton className={cn("rounded-panel", props.className)} />}
    >
      <AdventureMap {...props} />
    </Suspense>
  );
}
