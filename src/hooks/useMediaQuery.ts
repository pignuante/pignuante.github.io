import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. The server snapshot is `false`, so a
 * prerendered page and its first client render agree; the real value takes
 * over right after hydration and follows later viewport changes.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
