import type { WorldGridData } from "./useWorldGridData";
import {
  BIOME_COLORS,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BORDER,
  HOVER_OVERLAY_ALPHA,
  MAX_OCEAN_DEPTH_CELLS,
  OCEAN_DEPTH_DARKEN_MAX,
  OCEAN_WAVE_LIGHTEN,
  OCEAN_WAVE_PERIOD,
  VISITED_OVERLAY_ALPHA,
} from "./constants";
import {
  darkenColor,
  lightenColor,
  oceanColorFromLatitude,
  pixiHexToCss,
} from "./utils";

export interface CompositeInput {
  /** Screen-cell angular size in degrees (for coast-distance darkening scale) */
  cellAngularDeg: number;
  cellSize: number;
  cols: number;
  data: WorldGridData;
  /** Inverse projection: canvas px → [lon, lat], or null outside the projection */
  invert: (px: number, py: number) => [number, number] | null;
  rows: number;
}

export interface CompositeResult {
  bakedCanvas: OffscreenCanvas;
  cols: number;
  rows: number;
  /** Cell flat index → ISO country ID, visited countries only (hover lookup) */
  visitedCountryGrid: Map<number, string>;
}

/**
 * Extra hover tint drawn OVER the baked constant visited tint.
 * Alpha compositing: baked VISITED_OVERLAY_ALPHA + boost over it
 * ≈ the HOVER_OVERLAY_ALPHA emphasis the design wants.
 */
export const HOVER_BOOST_ALPHA =
  (HOVER_OVERLAY_ALPHA - VISITED_OVERLAY_ALPHA) / (1 - VISITED_OVERLAY_ALPHA);

/** Screen-cell country index markers */
const OUTSIDE = -1;
const OCEAN = 0;

/**
 * Composite one screen-cell grid from the pre-baked world grid:
 * inverse-project each cell center, sample country/coast data, and bake
 * land (biome color + visited tint + neighbor-diff borders) and ocean
 * (latitude bands + coast-distance darkening + wave pattern) into a
 * single canvas. Shared by the flat map (once) and the globe (per rotation).
 */
export function compositeWorldGrid({
  cellAngularDeg,
  cellSize,
  cols,
  data,
  invert,
  rows,
}: CompositeInput): CompositeResult {
  const { coastCells, countries, countryIdx, degPerCell, gridH, gridW } = data;
  const halfCell = Math.floor(cellSize / 2);
  const size = cols * rows;

  // ── Pass 1: sample world grid per screen cell ──
  const screenCountry = new Int16Array(size).fill(OUTSIDE);
  const screenAbsLat = new Float32Array(size);
  const screenCoastDeg = new Float32Array(size);

  for (let row = 0; row < rows; row++) {
    const py = row * cellSize + halfCell;
    for (let col = 0; col < cols; col++) {
      const lonLat = invert(col * cellSize + halfCell, py);
      if (!lonLat) continue;
      const [lon, lat] = lonLat;
      if (!Number.isFinite(lon) || lon < -180 || lon > 180) continue;
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) continue;

      const gCol = Math.min(Math.floor(((lon + 180) / 360) * gridW), gridW - 1);
      const gRow = Math.min(Math.floor(((90 - lat) / 180) * gridH), gridH - 1);
      const gIdx = gRow * gridW + gCol;

      const idx = row * cols + col;
      screenCountry[idx] = countryIdx[gIdx];
      screenAbsLat[idx] = Math.abs(lat);
      screenCoastDeg[idx] = coastCells[gIdx] * degPerCell;
    }
  }

  // ── Pass 2: bake colors into one canvas ──
  const bakedCanvas = new OffscreenCanvas(cols * cellSize, rows * cellSize);
  const ctx = bakedCanvas.getContext("2d");
  const visitedCountryGrid = new Map<number, string>();
  if (!ctx) return { bakedCanvas, cols, rows, visitedCountryGrid };

  const cellW = cellSize - 1;
  const cssColorCache = new Map<number, string>();
  const fillCell = (col: number, row: number, hex: number): void => {
    let css = cssColorCache.get(hex);
    if (!css) {
      css = pixiHexToCss(hex);
      cssColorCache.set(hex, css);
    }
    ctx.fillStyle = css;
    ctx.fillRect(col * cellSize, row * cellSize, cellW, cellW);
  };

  const borderCells: number[] = [];
  const visitedCells: number[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const country = screenCountry[idx];
      if (country === OUTSIDE) continue;

      if (country === OCEAN) {
        let color = oceanColorFromLatitude(screenAbsLat[idx]);
        const distCells = screenCoastDeg[idx] / cellAngularDeg;
        if (distCells > 0) {
          const t = Math.min(distCells / MAX_OCEAN_DEPTH_CELLS, 1);
          color = darkenColor(color, t * OCEAN_DEPTH_DARKEN_MAX);
        }
        if ((col + row * 2) % OCEAN_WAVE_PERIOD === 0) {
          color = lightenColor(color, OCEAN_WAVE_LIGHTEN);
        }
        fillCell(col, row, color);
        continue;
      }

      const entry = countries[country - 1];
      fillCell(col, row, BIOME_COLORS[entry.biome]);
      if (entry.visited) {
        visitedCountryGrid.set(idx, entry.iso);
        visitedCells.push(idx);
      }

      // Border: any 4-neighbor belonging to a different country / the ocean
      const isBorder =
        (col > 0 && differs(screenCountry[idx - 1], country)) ||
        (col < cols - 1 && differs(screenCountry[idx + 1], country)) ||
        (row > 0 && differs(screenCountry[idx - cols], country)) ||
        (row < rows - 1 && differs(screenCountry[idx + cols], country));
      if (isBorder) borderCells.push(idx);
    }
  }

  ctx.globalAlpha = VISITED_OVERLAY_ALPHA;
  for (const idx of visitedCells) {
    fillCell(idx % cols, Math.floor(idx / cols), COLOR_VISITED_TINT);
  }
  ctx.globalAlpha = 0.4; // matches the previous vector-stroke border layer alpha
  for (const idx of borderCells) {
    fillCell(idx % cols, Math.floor(idx / cols), COLOR_WORLD_BORDER);
  }
  ctx.globalAlpha = 1;

  return { bakedCanvas, cols, rows, visitedCountryGrid };
}

/** Neighbor differs when it is another country or the ocean (not outside the projection) */
function differs(neighbor: number, country: number): boolean {
  return neighbor !== country && neighbor !== OUTSIDE;
}
