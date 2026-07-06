import type { Biome, CountryBiomeEntry } from "./types";
import countryData from "./world-countries.json";

/**
 * Manual biome classification for major countries.
 * Key = ISO 3166-1 numeric code (string).
 * Data lives in world-countries.json so the build-time world grid
 * bake script (scripts/bake-world-grid.mjs) can read the same source.
 * Countries not listed here use the latitude-based fallback below.
 */
export const COUNTRY_BIOMES: ReadonlyArray<CountryBiomeEntry> =
  countryData as ReadonlyArray<CountryBiomeEntry>;

/** Quick lookup: country ID → biome entry */
export const COUNTRY_BIOME_MAP: ReadonlyMap<string, CountryBiomeEntry> =
  new Map(COUNTRY_BIOMES.map((entry) => [entry.id, entry]));

/**
 * Fallback biome classification based on centroid latitude.
 * Used for countries not manually classified in COUNTRY_BIOMES.
 * Mirrored in scripts/bake-world-grid.mjs — keep the thresholds in sync.
 */
export function biomeFromLatitude(lat: number): Biome {
  const absLat = Math.abs(lat);
  if (absLat > 60) return "polar";
  if (absLat > 45) return "continental";
  if (absLat < 23.5) return "tropical";
  return "temperate";
}
