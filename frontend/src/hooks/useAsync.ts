import { useEffect, useState } from "react";
import { ApiError } from "../api/client";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader on mount and whenever `deps` change, exposing the
 * loading and error states the pages need to render.
 *
 * Results from a superseded call are discarded, so a fast filter change or
 * route change cannot leave stale data on screen.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[]
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });

    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setState({ data: null, loading: false, error: message });
      });

    return () => {
      active = false;
    };
    // `loader` is intentionally excluded: callers pass an inline closure, and
    // `deps` already describes what the loader depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
