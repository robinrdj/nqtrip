import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` milliseconds, so a fast-changing input (a search
 * box) can drive a slow consumer (a network request) without firing on every
 * keystroke.
 *
 * The timer resets on each change, so the value only settles once typing pauses.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
