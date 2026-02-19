import type { Biome } from "./types";
import { COUNTRY_BIOME_MAP, biomeFromLatitude } from "./world-data";

/**
 * Wrap a pixel coordinate into [0, width) range.
 * Used for infinite horizontal panning in world map.
 */
export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

/** Convert PixiJS numeric hex to CSS color string (e.g. 0xff0000 → "#ff0000") */
export function pixiHexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/** Resolve biome for a country: manual lookup → latitude fallback */
export function resolveBiome(
  countryId: string | undefined,
  centroidLat: number,
): Biome {
  if (countryId) {
    const entry = COUNTRY_BIOME_MAP.get(countryId);
    if (entry) return entry.biome;
  }
  return biomeFromLatitude(centroidLat);
}
