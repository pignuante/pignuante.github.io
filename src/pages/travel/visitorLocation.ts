import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { WorldGridData } from "./useWorldGridData";
import TIMEZONE_COORDS from "./timezone-coords.json";

/** [latitude, longitude] in degrees */
export type LatLon = readonly [number, number];

export type LocationSource = "precise" | "timezone";

export type PreciseStatus =
  "denied" | "idle" | "locating" | "ok" | "unavailable";

export interface VisitorLocation {
  point: LatLon;
  source: LocationSource;
}

// JSON arrays type as number[]; the bake script writes [lat, lon] pairs.
const COORDS = TIMEZONE_COORDS as unknown as Record<string, LatLon>;

/**
 * Coastal zone cities (Tokyo, Lisbon) can land on an ocean cell of the
 * 0.25° world grid; search this many cells outward for the nearest land.
 */
const LAND_SEARCH_RADIUS_CELLS = 8;

/** Principal-city coordinates of an IANA time zone, from tzdb (baked). */
export function timeZoneCoords(timeZone: null | string): LatLon | null {
  return timeZone ? (COORDS[timeZone] ?? null) : null;
}

/**
 * 1-based world-grid country index at a point, or 0 when no land lies
 * within LAND_SEARCH_RADIUS_CELLS (open ocean).
 */
export function countryIndexAt(
  data: Pick<WorldGridData, "countryIdx" | "gridH" | "gridW">,
  [lat, lon]: LatLon,
): number {
  const { countryIdx, gridH, gridW } = data;
  const col = Math.min(Math.floor(((lon + 180) / 360) * gridW), gridW - 1);
  const row = Math.min(Math.floor(((90 - lat) / 180) * gridH), gridH - 1);
  const at = (r: number, c: number): number =>
    r < 0 || r >= gridH ? 0 : countryIdx[r * gridW + ((c + gridW) % gridW)];

  if (at(row, col) !== 0) return at(row, col);
  for (let radius = 1; radius <= LAND_SEARCH_RADIUS_CELLS; radius++) {
    let best = 0;
    let bestDistance = Infinity;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
        const index = at(row + dr, col + dc);
        const distance = dr * dr + dc * dc;
        if (index !== 0 && distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      }
    }
    if (best !== 0) return best;
  }
  return 0;
}

const noSubscribe = (): (() => void) => () => {};
const readTimeZone = (): null | string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
const serverTimeZone = (): null => null;

/**
 * The visitor's own location, never stored or sent anywhere:
 * - by default the principal city of the browser time zone (no prompt),
 * - after requestPrecise(), the Geolocation API position (asks permission).
 */
export function useVisitorLocation(): {
  canRequestPrecise: boolean;
  location: null | VisitorLocation;
  preciseStatus: PreciseStatus;
  requestPrecise: () => void;
} {
  const timeZone = useSyncExternalStore(
    noSubscribe,
    readTimeZone,
    serverTimeZone,
  );
  const [precise, setPrecise] = useState<LatLon | null>(null);
  const [preciseStatus, setPreciseStatus] = useState<PreciseStatus>("idle");

  const canRequestPrecise = useSyncExternalStore(
    noSubscribe,
    () => "geolocation" in navigator,
    () => false,
  );

  const requestPrecise = useCallback((): void => {
    if (!("geolocation" in navigator)) {
      setPreciseStatus("unavailable");
      return;
    }
    setPreciseStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPrecise([coords.latitude, coords.longitude]);
        setPreciseStatus("ok");
      },
      (error) => {
        setPreciseStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        );
      },
      { maximumAge: 10 * 60 * 1000, timeout: 15_000 },
    );
  }, []);

  // Stable identity: map overlays redraw only when the location changes,
  // not on every render during a drag.
  const location = useMemo<null | VisitorLocation>(() => {
    if (precise) return { point: precise, source: "precise" };
    const zonePoint = timeZoneCoords(timeZone);
    return zonePoint ? { point: zonePoint, source: "timezone" } : null;
  }, [precise, timeZone]);

  return { canRequestPrecise, location, preciseStatus, requestPrecise };
}
