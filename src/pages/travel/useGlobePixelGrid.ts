import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { geoCentroid, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type {
  BoundaryPixel,
  ColoredPixelCell,
  GlobeRotation,
  WorldPixelGridResult,
} from "./types";
import {
  BIOME_COLORS,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BORDER,
  GLOBE_CELL_SIZE,
  GLOBE_SIZE,
  VISITED_OVERLAY_ALPHA,
} from "./constants";
import { buildOceanCells, pixiHexToCss, resolveBiome } from "./utils";
import { COUNTRY_BIOME_MAP } from "./world-data";

/* ── Pure rasterization function (extracted for performance) ── */

/**
 * Rasterize world-atlas countries onto an orthographic projection.
 *
 * Pipeline (mirrors useWorldPixelGrid):
 * 1. Project with geoOrthographic fitted to square canvas
 * 2. Canvas 1: Fill each country with biome color
 * 3. Canvas 2: Visited mask (white fill on visited countries)
 * 4. Canvas 3: Border strokes on all countries
 * 5. Pixel sampling -> ColoredPixelCell[] + BoundaryPixel[]
 * 6. Marker projection for visited countries
 */
/** Empty grid for early-return on canvas context failure */
const EMPTY_GRID: WorldPixelGridResult = {
  boundaryPixels: [],
  cells: [],
  cols: 0,
  rows: 0,
};

function rasterizeGlobe(
  countries: FeatureCollection<Geometry>,
  rotation: GlobeRotation,
): WorldPixelGridResult {
  const cols = Math.floor(GLOBE_SIZE / GLOBE_CELL_SIZE);
  const rows = Math.floor(GLOBE_SIZE / GLOBE_CELL_SIZE);

  // ── Projection: orthographic fitted to square canvas ──
  const projection = geoOrthographic()
    .clipAngle(90)
    .rotate([-rotation.lambda, -rotation.phi, 0])
    .fitSize([GLOBE_SIZE, GLOBE_SIZE], { type: "Sphere" });

  // ── Canvas 1: Fill each country with its biome color ──
  const fillCanvas = new OffscreenCanvas(GLOBE_SIZE, GLOBE_SIZE);
  const fillCtx = fillCanvas.getContext("2d");
  if (!fillCtx) return EMPTY_GRID;
  const fillPathGen = geoPath(
    projection,
    fillCtx as unknown as CanvasRenderingContext2D,
  );

  for (const countryFeature of countries.features) {
    const centroid = geoCentroid(countryFeature);
    const biome = resolveBiome(countryFeature.id?.toString(), centroid[1]);
    const color = pixiHexToCss(BIOME_COLORS[biome]);

    fillCtx.fillStyle = color;
    fillCtx.beginPath();
    fillPathGen(countryFeature);
    fillCtx.fill();
  }

  // ── Canvas 2: Visited-country ID canvas ──
  // Each visited country is filled with R = (visitedIndex + 1), 0 = not visited.
  const visitedCanvas = new OffscreenCanvas(GLOBE_SIZE, GLOBE_SIZE);
  const visitedCtx = visitedCanvas.getContext("2d");
  if (!visitedCtx) return EMPTY_GRID;
  const visitedPathGen = geoPath(
    projection,
    visitedCtx as unknown as CanvasRenderingContext2D,
  );

  /** Visited country index → ISO country ID */
  const visitedIdLookup: string[] = [];
  let visitedIndex = 0;

  for (const countryFeature of countries.features) {
    const id = countryFeature.id?.toString();
    const entry = id ? COUNTRY_BIOME_MAP.get(id) : undefined;
    if (!entry?.visited) continue;

    visitedIdLookup.push(entry.id);
    const encodedR = visitedIndex + 1;
    visitedCtx.fillStyle = `rgb(${encodedR},0,0)`;
    visitedCtx.beginPath();
    visitedPathGen(countryFeature);
    visitedCtx.fill();
    visitedIndex++;
  }

  const visitedImageData = visitedCtx.getImageData(
    0,
    0,
    GLOBE_SIZE,
    GLOBE_SIZE,
  );

  // ── Pixel sampling: read biome color per cell ──
  const fillImageData = fillCtx.getImageData(0, 0, GLOBE_SIZE, GLOBE_SIZE);
  const cells: ColoredPixelCell[] = [];
  const visitedCountryGrid = new Map<number, string>();
  const halfCell = Math.floor(GLOBE_CELL_SIZE / 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * GLOBE_CELL_SIZE + halfCell;
      const py = row * GLOBE_CELL_SIZE + halfCell;
      const idx = (py * GLOBE_SIZE + px) * 4;

      const r = fillImageData.data[idx];
      const g = fillImageData.data[idx + 1];
      const b = fillImageData.data[idx + 2];
      const a = fillImageData.data[idx + 3];

      // Skip transparent pixels (ocean OR back hemisphere)
      if (a < 128) continue;

      const color = (r << 16) | (g << 8) | b;

      // Check visited ID canvas (R channel = visitedIndex + 1, 0 = not visited)
      const visitedR = visitedImageData.data[idx];
      const visited = visitedR > 0;

      if (visited) {
        const countryId = visitedIdLookup[visitedR - 1];
        if (countryId) {
          visitedCountryGrid.set(row * cols + col, countryId);
        }
      }

      cells.push({ col, color, row, ...(visited && { visited: true }) });
    }
  }

  // ── Canvas 3: Stroke country boundaries ──
  const borderCanvas = new OffscreenCanvas(GLOBE_SIZE, GLOBE_SIZE);
  const borderCtx = borderCanvas.getContext("2d");
  if (!borderCtx) return EMPTY_GRID;
  const borderPathGen = geoPath(
    projection,
    borderCtx as unknown as CanvasRenderingContext2D,
  );

  borderCtx.strokeStyle = "#00ff00";
  borderCtx.lineWidth = 0.8;

  for (const countryFeature of countries.features) {
    borderCtx.beginPath();
    borderPathGen(countryFeature);
    borderCtx.stroke();
  }

  const borderImageData = borderCtx.getImageData(0, 0, GLOBE_SIZE, GLOBE_SIZE);

  // Build land lookup set for fast boundary filtering
  const landSet = new Set<number>(
    cells.map((c: ColoredPixelCell) => c.row * cols + c.col),
  );
  const boundaryPixels: BoundaryPixel[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!landSet.has(row * cols + col)) continue;

      const px = col * GLOBE_CELL_SIZE + halfCell;
      const py = row * GLOBE_CELL_SIZE + halfCell;
      const idx = (py * GLOBE_SIZE + px) * 4;

      // Green channel > 0 -> boundary stroke
      if (borderImageData.data[idx + 1] > 0) {
        boundaryPixels.push({ col, row });
      }
    }
  }

  // ── Ocean cells: latitude biome + coast distance gradient + wave pattern ──
  const HALF = GLOBE_SIZE / 2;
  const R_SQ = HALF * HALF;

  // Build globe-circle ocean set and latitude lookup in one pass
  const oceanIndices: number[] = [];
  const oceanLatMap = new Map<number, number>(); // index → absLat

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      if (landSet.has(idx)) continue;

      const px = col * GLOBE_CELL_SIZE + halfCell;
      const py = row * GLOBE_CELL_SIZE + halfCell;

      // Skip pixels outside the globe circle
      const dx = px - HALF;
      const dy = py - HALF;
      if (dx * dx + dy * dy > R_SQ) continue;

      // Inverse-project to get latitude
      const lonLat = projection.invert?.([px, py]);
      if (!lonLat) continue;

      oceanIndices.push(idx);
      oceanLatMap.set(idx, Math.abs(lonLat[1]));
    }
  }

  // Shared BFS + latitude biome + distance gradient + wave pattern
  const oceanCells = buildOceanCells({
    cols,
    landSet,
    oceanIndices,
    oceanLatMap,
    rows,
  });

  // ── Bake all rotation-dependent cell layers into one canvas ──
  // Rendered as a single sprite; per-cell Graphics rects rebuilt every
  // rotation frame cost 100-150ms and froze the drag.
  const bakedCanvas = new OffscreenCanvas(GLOBE_SIZE, GLOBE_SIZE);
  const bakedCtx = bakedCanvas.getContext("2d");
  if (bakedCtx) {
    const cellW = GLOBE_CELL_SIZE - 1;
    const cssColorCache = new Map<number, string>();
    const cssOf = (hex: number): string => {
      let css = cssColorCache.get(hex);
      if (!css) {
        css = pixiHexToCss(hex);
        cssColorCache.set(hex, css);
      }
      return css;
    };
    const fillCell = (col: number, row: number, hex: number): void => {
      bakedCtx.fillStyle = cssOf(hex);
      bakedCtx.fillRect(
        col * GLOBE_CELL_SIZE,
        row * GLOBE_CELL_SIZE,
        cellW,
        cellW,
      );
    };

    for (const cell of oceanCells) fillCell(cell.col, cell.row, cell.color);
    for (const cell of cells) fillCell(cell.col, cell.row, cell.color);

    bakedCtx.globalAlpha = VISITED_OVERLAY_ALPHA;
    for (const cell of cells) {
      if (cell.visited) fillCell(cell.col, cell.row, COLOR_VISITED_TINT);
    }

    bakedCtx.globalAlpha = 0.4; // matches previous GlobeBorders layer alpha
    for (const cell of boundaryPixels) {
      fillCell(cell.col, cell.row, COLOR_WORLD_BORDER);
    }
    bakedCtx.globalAlpha = 1;
  }

  return {
    bakedCanvas,
    boundaryPixels,
    cells,
    cols,
    oceanCells,
    rows,
    visitedCountryGrid,
  };
}

/* ── Hook ── */

/**
 * Pixel-art globe grid hook.
 *
 * Loads world-atlas topology once (cached in ref), then rasterizes
 * an orthographic projection via useMemo on every rotation change.
 */
export function useGlobePixelGrid(
  rotation: GlobeRotation,
): WorldPixelGridResult | null {
  const topoRef = useRef<FeatureCollection<Geometry> | null>(null);
  const [topoVersion, setTopoVersion] = useState(0);

  // Load topology once, cache in ref
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 110m here on purpose: the globe re-rasterizes every rotation frame,
      // and 50m polygons push one pass to 150-190ms (frozen drag). The flat
      // map rasterizes once on load, so it can afford 50m.
      const topology =
        (await import("world-atlas/countries-110m.json")) as unknown as Topology<{
          countries: GeometryCollection;
          land: GeometryCollection;
        }>;

      const countries = feature(topology, topology.objects.countries);

      if (!cancelled) {
        topoRef.current = countries;
        setTopoVersion(1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Rasterize on rotation change — throttled to one rAF per update cycle
  // to avoid full re-rasterization on every pointermove during drag
  const [result, setResult] = useState<WorldPixelGridResult | null>(null);
  const rafRef = useRef<number>(0);

  const lambda = rotation.lambda;
  const phi = rotation.phi;

  useEffect(() => {
    if (!topoRef.current) return;

    cancelAnimationFrame(rafRef.current);

    const countries = topoRef.current;
    rafRef.current = requestAnimationFrame(() => {
      setResult(rasterizeGlobe(countries, { lambda, phi }));
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [topoVersion, lambda, phi]);

  return result;
}
