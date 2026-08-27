import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { AdventureListResponse, AdventureQuery } from "../types";

/**
 * Query keys in one place.
 *
 * Every key starts with a stable prefix, so a broad
 * `invalidateQueries({ queryKey: keys.adventures.all })` reaches every
 * filtered variation without needing to know which ones are cached.
 */
export const keys = {
  cities: ["cities"] as const,
  adventures: {
    all: ["adventures"] as const,
    list: (query: Partial<AdventureQuery>) => ["adventures", "list", query] as const,
    detail: (id: string) => ["adventures", "detail", id] as const,
  },
  reviews: (adventureId: string) => ["reviews", adventureId] as const,
  reservations: ["reservations"] as const,
  wishlist: ["wishlist"] as const,
};

export function useCities() {
  return useQuery({
    queryKey: keys.cities,
    queryFn: ({ signal }) => api.fetchCities(signal),
    // Cities change about never; not refetching them is most of the win here.
    staleTime: 30 * 60 * 1000,
  });
}

export function useAdventures(query: Partial<AdventureQuery>) {
  return useQuery({
    queryKey: keys.adventures.list(query),
    queryFn: ({ signal }) => api.fetchAdventures(query, signal),
    // Keeps the previous page on screen while the next one loads, so changing a
    // filter dims the results rather than collapsing the layout to skeletons.
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useAdventure(id: string | undefined) {
  return useQuery({
    queryKey: keys.adventures.detail(id ?? ""),
    queryFn: ({ signal }) => api.fetchAdventure(id!, signal),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useReviews(adventureId: string | undefined) {
  return useQuery({
    queryKey: keys.reviews(adventureId ?? ""),
    queryFn: ({ signal }) => api.fetchReviews(adventureId!, signal),
    enabled: Boolean(adventureId),
  });
}

export function useReservations(enabled: boolean) {
  return useQuery({
    queryKey: keys.reservations,
    queryFn: ({ signal }) => api.fetchReservations(signal),
    enabled,
  });
}

export function useWishlist(enabled: boolean) {
  return useQuery({
    queryKey: keys.wishlist,
    queryFn: ({ signal }) => api.fetchWishlist(signal),
    enabled,
  });
}

/**
 * Saves or unsaves an adventure, updating the UI before the server answers.
 *
 * The heart has to feel instant, so every cached list and detail entry holding
 * this id is patched up front and rolled back if the request fails.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.toggleWishlist,

    onMutate: async (adventureId: string) => {
      // Stop any in-flight refetch from landing on top of the optimistic edit.
      await queryClient.cancelQueries({ queryKey: keys.adventures.all });

      const listSnapshots = queryClient.getQueriesData<AdventureListResponse>({
        queryKey: ["adventures", "list"],
      });
      const detailSnapshot = queryClient.getQueryData(
        keys.adventures.detail(adventureId)
      );

      for (const [key, value] of listSnapshots) {
        if (!value) continue;
        const savedIds = value.savedIds.includes(adventureId)
          ? value.savedIds.filter((id) => id !== adventureId)
          : [...value.savedIds, adventureId];
        queryClient.setQueryData(key, { ...value, savedIds });
      }

      queryClient.setQueryData(
        keys.adventures.detail(adventureId),
        (current: { adventure: unknown; saved: boolean } | undefined) =>
          current ? { ...current, saved: !current.saved } : current
      );

      return { listSnapshots, detailSnapshot, adventureId };
    },

    onError: (error, _adventureId, context) => {
      for (const [key, value] of context?.listSnapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
      if (context) {
        queryClient.setQueryData(
          keys.adventures.detail(context.adventureId),
          context.detailSnapshot
        );
      }

      toast.error(
        error instanceof ApiError && error.isUnauthorized
          ? "Sign in to save adventures."
          : "We could not save that. Please try again."
      );
    },

    onSuccess: ({ saved }) => {
      toast.success(saved ? "Saved to your list" : "Removed from your list");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.wishlist });
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createReservation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.reservations });
      // Seat counts changed, so both the detail page and any list showing this
      // adventure are now stale.
      queryClient.invalidateQueries({
        queryKey: keys.adventures.detail(variables.adventure),
      });
      queryClient.invalidateQueries({ queryKey: ["adventures", "list"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.reservations });
      queryClient.invalidateQueries({ queryKey: keys.adventures.all });
      toast.success("Booking cancelled. Your seats are back on sale.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "We could not cancel that booking."
      );
    },
  });
}

export function useSubmitReview(adventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: { rating: number; title?: string; body: string }) =>
      api.submitReview(adventureId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.reviews(adventureId) });
      // The aggregate rating on the adventure just moved.
      queryClient.invalidateQueries({
        queryKey: keys.adventures.detail(adventureId),
      });
      queryClient.invalidateQueries({ queryKey: ["adventures", "list"] });
      toast.success("Thanks — your review is live.");
    },
  });
}

export function useDeleteReview(adventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.reviews(adventureId) });
      queryClient.invalidateQueries({
        queryKey: keys.adventures.detail(adventureId),
      });
      toast.success("Review deleted.");
    },
  });
}
