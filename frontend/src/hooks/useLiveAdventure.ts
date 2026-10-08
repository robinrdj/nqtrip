import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { liveAdventureUrl } from "../api/client";
import type { Adventure, SeatUpdate } from "../types";
import { keys } from "./queries";

export interface LiveState {
  /** People with this adventure open right now, including this visitor. */
  viewers: number | null;
  connected: boolean;
}

/**
 * Keeps an adventure's seat count current while its page is open.
 *
 * Updates are written into the React Query cache rather than held in local
 * state, so every component already reading the adventure — the header's seat
 * count, the booking form's "3 left" warning, the sold-out button — updates
 * from the one source, with no extra wiring.
 *
 * EventSource reconnects by itself after a drop (the server sets the delay),
 * so the only failure handling needed here is reporting the connection state.
 */
export function useLiveAdventure(adventureId: string | undefined): LiveState {
  const queryClient = useQueryClient();
  const [viewers, setViewers] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Absent in jsdom and some embedded browsers; the page works without it.
    if (!adventureId || typeof EventSource === "undefined") return;

    const source = new EventSource(liveAdventureUrl(adventureId));

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.addEventListener("seats", (event) => {
      const update = JSON.parse((event as MessageEvent<string>).data) as SeatUpdate;

      queryClient.setQueryData<{ adventure: Adventure; saved: boolean }>(
        keys.adventures.detail(adventureId),
        (current) =>
          current && {
            ...current,
            adventure: {
              ...current.adventure,
              capacity: update.capacity,
              booked: update.booked,
              seatsLeft: update.seatsLeft,
              available: update.seatsLeft > 0,
            },
          }
      );
    });

    source.addEventListener("viewers", (event) => {
      const { count } = JSON.parse((event as MessageEvent<string>).data) as { count: number };
      setViewers(count);
    });

    return () => {
      source.close();
      setConnected(false);
      setViewers(null);
    };
  }, [adventureId, queryClient]);

  return { viewers, connected };
}
