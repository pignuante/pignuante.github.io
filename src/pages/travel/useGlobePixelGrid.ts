import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { geoCentroid, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type {
  BoundaryPixel,
  ColoredPixelCell,
  GlobeRotation,
  ProjectedCountryMarker,
  WorldPixelGridResult,
} from "./types";
import { BIOME_COLORS, GLOBE_CELL_SIZE, GLOBE_SIZE } from "./constants";
import { pixiHexToCss, resolveBiome } from "./utils";
import { COUNTRY_BIOME_MAP, COUNTRY_BIOMES } from "./world-data";

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
  markers: [],
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

  // ── Canvas 2: Visited-country mask (white on transparent) ──
  const visitedCanvas = new OffscreenCanvas(GLOBE_SIZE, GLOBE_SIZE);
  const visitedCtx = visitedCanvas.getContext("2d");
  if (!visitedCtx) return EMPTY_GRID;
  const visitedPathGen = geoPath(
    projection,
    visitedCtx as unknown as CanvasRenderingContext2D,
  );

  for (const countryFeature of countries.features) {
    const id = countryFeature.id?.toString();
    const entry = id ? COUNTRY_BIOME_MAP.get(id) : undefined;
    if (!entry?.visited) continue;

    visitedCtx.fillStyle = "#ffffff";
    visitedCtx.beginPath();
    visitedPathGen(countryFeature);
    visitedCtx.fill();
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

      // Check visited mask (red channel — white fill = 255)
      const visited = visitedImageData.data[idx] > 128;

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

  // ── Markers: project centroids for visited countries ──
  const markers: ProjectedCountryMarker[] = [];

  for (const entry of COUNTRY_BIOMES) {
    if (!entry.visited) continue;

    const countryFeature = countries.features.find(
      (f) => f.id?.toString() === entry.id,
    );
    if (!countryFeature) continue;

    const centroid = geoCentroid(countryFeature);
    const projected = projection(centroid);

    // Only include markers on the visible hemisphere
    if (!projected) continue;

    markers.push({
      id: entry.id,
      name: entry.name,
      nameKo: entry.nameKo,
      visited: true,
      x: projected[0],
      y: projected[1],
    });
  }

  return { boundaryPixels, cells, cols, markers, rows };
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
