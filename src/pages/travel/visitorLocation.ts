import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { WorldGridData } from "./useWorldGridData";
import TIMEZONE_DATA from "./timezone-coords.json";

/** [latitude, longitude] in degrees */
export type LatLon = readonly [number, number];

export type LocationSource = "precise" | "timezone";

export type PreciseStatus =
  "denied" | "idle" | "locating" | "ok" | "unavailable";

export interface VisitorLocation {
  /** ISO 3166-1 alpha-2, or null when unknown (open ocean, no data) */
  countryCode: null | string;
  point: LatLon;
  source: LocationSource;
}

// JSON arrays type as (number | string)[]; the bake script writes
// [lat, lon, alpha2] per zone and alpha2 -> ISO numeric per country.
const DATA = TIMEZONE_DATA as unknown as {
  numeric: Record<string, string>;
  zones: Record<string, readonly [number, number, string]>;
};
const ALPHA2_BY_NUMERIC = new Map(
  Object.entries(DATA.numeric).map(([alpha2, numeric]) => [numeric, alpha2]),
);

/**
 * A precise position on an ocean cell of the 0.25° world grid (a coastal
 * city, a small island) takes the nearest land within this many cells.
 */
const LAND_SEARCH_RADIUS_CELLS = 8;

const regionNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["ko"], { type: "region" })
    : null;

/** Korean country or territory name ("KR" -> "대한민국", "HK" -> "홍콩"). */
export function countryName(alpha2: string): string {
  return regionNames?.of(alpha2) ?? alpha2;
}

/** Principal-city point and country of an IANA time zone (tzdb, baked). */
export function timeZoneLocation(
  timeZone: null | string,
): null | Pick<VisitorLocation, "countryCode" | "point"> {
  const zone = timeZone ? DATA.zones[timeZone] : undefined;
  return zone ? { countryCode: zone[2], point: [zone[0], zone[1]] } : null;
}

/**
 * 1-based world-grid country index of an alpha-2 country, or 0 when the
 * grid has no such country (then only the pin and the name are shown).
 */
export function gridCountryIndex(
  data: Pick<WorldGridData, "countries">,
  alpha2: null | string,
): number {
  const numeric = alpha2 ? DATA.numeric[alpha2] : undefined;
  if (!numeric) return 0;
  const index = data.countries.findIndex((country) => country.iso === numeric);
  return index + 1;
}

/**
 * Alpha-2 country at a point from the 0.25° world grid, searching the
 * geographically nearest land cell within LAND_SEARCH_RADIUS_CELLS when the
 * point itself is ocean. Microstates below the grid resolution resolve to
 * their neighbour here; time-zone locations use the baked code instead.
 */
export function countryCodeAt(
  data: Pick<WorldGridData, "countries" | "countryIdx" | "gridH" | "gridW">,
  [lat, lon]: LatLon,
): null | string {
  const { countries, countryIdx, gridH, gridW } = data;
  const col = Math.min(Math.floor(((lon + 180) / 360) * gridW), gridW - 1);
  const row = Math.min(Math.floor(((90 - lat) / 180) * gridH), gridH - 1);
  // Longitude cells shrink with latitude; weighting them makes this an
  // approximately geographic nearest (in whole cells, not great-circle).
  const lonWeight = Math.cos((lat * Math.PI) / 180) ** 2;

  let best = 0;
  let bestDistance = Infinity;
  const radius = LAND_SEARCH_RADIUS_CELLS;
  for (let dr = -radius; dr <= radius; dr++) {
    const r = row + dr;
    if (r < 0 || r >= gridH) continue;
    for (let dc = -radius; dc <= radius; dc++) {
      const index = countryIdx[r * gridW + ((col + dc + gridW) % gridW)];
      if (index === 0) continue;
      const distance = dr * dr + dc * dc * lonWeight;
      // Ties go to the earlier scan position, so the result is deterministic.
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    }
  }
  if (best === 0) return null;
  return ALPHA2_BY_NUMERIC.get(countries[best - 1].iso) ?? null;
}

const noSubscribe = (): (() => void) => () => {};
const readTimeZone = (): null | string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
const serverTimeZone = (): null => null;

/**
 * The visitor's own location, never stored or sent anywhere:
 * - by default the principal city of the browser time zone (no prompt),
 * - after requestPrecise(), the Geolocation API position (asks permission).
 * `worldData` resolves the country of a precise position; null until loaded.
 */
export function useVisitorLocation(worldData: null | WorldGridData): {
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

  // Stable identity: map overlays rebuild only when the location changes,
  // not on every render during a drag.
  const location = useMemo<null | VisitorLocation>(() => {
    if (precise) {
      return {
        countryCode: worldData ? countryCodeAt(worldData, precise) : null,
        point: precise,
        source: "precise",
      };
    }
    const zone = timeZoneLocation(timeZone);
    return zone ? { ...zone, source: "timezone" } : null;
  }, [precise, timeZone, worldData]);

  return { canRequestPrecise, location, preciseStatus, requestPrecise };
}
