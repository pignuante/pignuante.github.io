import type { Biome, ColoredPixelCell } from "./types";
import {
  COLOR_OCEAN_POLAR,
  COLOR_OCEAN_SUBTROPICAL,
  COLOR_OCEAN_TEMPERATE,
  COLOR_OCEAN_TROPICAL,
  MAX_OCEAN_DEPTH_CELLS,
  OCEAN_DEPTH_DARKEN_MAX,
  OCEAN_WAVE_LIGHTEN,
  OCEAN_WAVE_PERIOD,
} from "./constants";
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

/**
 * Darken a PixiJS hex color by a factor (0 = unchanged, 1 = black).
 * Each RGB channel is multiplied by `(1 - factor)`.
 */
export function darkenColor(hex: number, factor: number): number {
  const scale = 1 - factor;
  const r = Math.round(((hex >> 16) & 0xff) * scale);
  const g = Math.round(((hex >> 8) & 0xff) * scale);
  const b = Math.round((hex & 0xff) * scale);
  return (r << 16) | (g << 8) | b;
}

/**
 * Lighten a PixiJS hex color by adding `amount` to each channel (capped at 255).
 * Used for sparse wave-highlight dots on ocean cells.
 */
export function lightenColor(hex: number, amount: number): number {
  const r = Math.min(((hex >> 16) & 0xff) + amount, 255);
  const g = Math.min(((hex >> 8) & 0xff) + amount, 255);
  const b = Math.min((hex & 0xff) + amount, 255);
  return (r << 16) | (g << 8) | b;
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

/* ── Ocean cell builder (shared between globe and flat map) ── */

/** Input for projection-agnostic ocean cell generation */
export interface OceanCellsInput {
  cols: number;
  /** Set of flat indices (row * cols + col) for all land cells */
  landSet: Set<number>;
  /** Flat indices of ocean cells to color */
  oceanIndices: number[];
  /**
   * Map from ocean flat index → absolute latitude (degrees, 0–90).
   * INVARIANT: Every index in `oceanIndices` MUST have a corresponding entry.
   */
  oceanLatMap: Map<number, number>;
  rows: number;
}

/** Resolve latitude band to ocean base color (PixiJS hex) */
function oceanColorFromLatitude(absLat: number): number {
  if (absLat < 20) return COLOR_OCEAN_TROPICAL;
  if (absLat < 40) return COLOR_OCEAN_SUBTROPICAL;
  if (absLat < 60) return COLOR_OCEAN_TEMPERATE;
  return COLOR_OCEAN_POLAR;
}

/**
 * Build colored ocean cells with three layered effects:
 * 1. Latitude-based biome color (4 bands)
 * 2. Distance-from-coast darkening (BFS flood-fill)
 * 3. Fantasy wave pattern (sparse diagonal highlight dots)
 *
 * Projection-agnostic: callers provide pre-filtered ocean indices
 * and latitude data from their specific projection.
 */
export function buildOceanCells({
  cols,
  landSet,
  oceanIndices,
  oceanLatMap,
  rows,
}: OceanCellsInput): ColoredPixelCell[] {
  // ── BFS flood-fill from land → ocean to compute distance-to-coast ──
  const oceanSet = new Set(oceanIndices);
  const distGrid = new Int16Array(rows * cols);
  distGrid.fill(-1);

  const queue: number[] = [];
  for (const landIdx of landSet) {
    distGrid[landIdx] = 0;
    queue.push(landIdx);
  }

  const DIR_OFFSETS: readonly number[] = [-cols, cols, -1, 1];
  let head = 0;

  while (head < queue.length) {
    const curIdx = queue[head++];
    const curDist = distGrid[curIdx];
    const curRow = Math.floor(curIdx / cols);
    const curCol = curIdx % cols;

    for (let d = 0; d < 4; d++) {
      if (d === 0 && curRow === 0) continue;
      if (d === 1 && curRow === rows - 1) continue;
      if (d === 2 && curCol === 0) continue;
      if (d === 3 && curCol === cols - 1) continue;

      const nIdx = curIdx + DIR_OFFSETS[d];
      if (!oceanSet.has(nIdx) || distGrid[nIdx] >= 0) continue;

      distGrid[nIdx] = curDist + 1;
      queue.push(nIdx);
    }
  }

  // ── Build colored cells: latitude biome → distance darken → wave highlight ──
  const cells: ColoredPixelCell[] = [];

  for (const idx of oceanIndices) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;

    const absLat = oceanLatMap.get(idx);
    if (absLat === undefined) continue;

    let color = oceanColorFromLatitude(absLat);

    // Darken by distance from coast (deeper = darker)
    const dist = distGrid[idx];
    if (dist > 0) {
      const t = Math.min(dist / MAX_OCEAN_DEPTH_CELLS, 1);
      color = darkenColor(color, t * OCEAN_DEPTH_DARKEN_MAX);
    } else if (dist < 0) {
      // Unreachable from land — apply maximum depth darkening
      color = darkenColor(color, OCEAN_DEPTH_DARKEN_MAX);
    }

    // Fantasy wave pattern: sparse diagonal highlight dots
    if ((col + row * 2) % OCEAN_WAVE_PERIOD === 0) {
      color = lightenColor(color, OCEAN_WAVE_LIGHTEN);
    }

    cells.push({ col, color, row });
  }

  return cells;
}
