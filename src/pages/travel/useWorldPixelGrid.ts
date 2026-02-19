import type { GeometryCollection, Topology } from "topojson-specification";
import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type {
  Biome,
  BoundaryPixel,
  ColoredPixelCell,
  ProjectedCountryMarker,
  WorldPixelGridResult,
} from "./types";
import {
  BIOME_COLORS,
  WORLD_CELL_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_INSET,
  WORLD_MAP_WIDTH,
} from "./constants";
import {
  COUNTRY_BIOME_MAP,
  COUNTRY_BIOMES,
  biomeFromLatitude,
} from "./world-data";

/** Resolve biome for a country: manual lookup → latitude fallback */
function resolveBiome(
  countryId: string | undefined,
  centroidLat: number,
): Biome {
  if (countryId) {
    const entry = COUNTRY_BIOME_MAP.get(countryId);
    if (entry) return entry.biome;
  }
  return biomeFromLatitude(centroidLat);
}

/** Convert PixiJS hex to CSS color string for canvas fill */
function pixiHexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/**
 * Rasterize world-atlas 110m data into a colored pixel grid.
 *
 * 1. Load countries-110m.json (code-split, 105KB)
 * 2. Project with geoNaturalEarth1 fitted to full canvas (minus inset)
 * 3. Fill each country on offscreen canvas with its biome color
 * 4. Sample pixel grid → ColoredPixelCell[]
 * 5. Stroke country boundaries on second canvas → BoundaryPixel[]
 */
export function useWorldPixelGrid(): WorldPixelGridResult | null {
  const [result, setResult] = useState<WorldPixelGridResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // ── Load topology ──
      const topology =
        (await import("world-atlas/countries-110m.json")) as unknown as Topology<{
          countries: GeometryCollection;
          land: GeometryCollection;
        }>;

      const countries = feature(topology, topology.objects.countries);

      // ── Projection: Natural Earth 1 fitted to full canvas with minimal inset ──
      const projection = geoNaturalEarth1().fitExtent(
        [
          [WORLD_MAP_INSET, WORLD_MAP_INSET],
          [
            WORLD_MAP_WIDTH - WORLD_MAP_INSET,
            WORLD_MAP_HEIGHT - WORLD_MAP_INSET,
          ],
        ],
        countries,
      );

      // ── Canvas 1: Fill each country with its biome color ──
      const fillCanvas = new OffscreenCanvas(WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT);
      const fillCtx = fillCanvas.getContext("2d");
      if (!fillCtx) return;

      // d3-geo typing gap: OffscreenCanvas2D is API-compatible with Canvas2D
      const pathGen = geoPath(
        projection,
        fillCtx as unknown as CanvasRenderingContext2D,
      );

      for (const countryFeature of countries.features) {
        const centroid = geoCentroid(countryFeature);
        const biome = resolveBiome(countryFeature.id?.toString(), centroid[1]);
        const color = pixiHexToCss(BIOME_COLORS[biome]);

        fillCtx.fillStyle = color;
        fillCtx.beginPath();
        pathGen(countryFeature);
        fillCtx.fill();
      }

      // ── Canvas 1b: Visited-country mask (white on black) ──
      const visitedCanvas = new OffscreenCanvas(
        WORLD_MAP_WIDTH,
        WORLD_MAP_HEIGHT,
      );
      const visitedCtx = visitedCanvas.getContext("2d");

      if (visitedCtx) {
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
      }

      const visitedImageData = visitedCtx?.getImageData(
        0,
        0,
        WORLD_MAP_WIDTH,
        WORLD_MAP_HEIGHT,
      );

      // ── Pixel sampling: read biome color per cell ──
      const cols = Math.floor(WORLD_MAP_WIDTH / WORLD_CELL_SIZE);
      const rows = Math.floor(WORLD_MAP_HEIGHT / WORLD_CELL_SIZE);
      const imageData = fillCtx.getImageData(
        0,
        0,
        WORLD_MAP_WIDTH,
        WORLD_MAP_HEIGHT,
      );
      const cells: ColoredPixelCell[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * WORLD_CELL_SIZE + Math.floor(WORLD_CELL_SIZE / 2);
          const py = row * WORLD_CELL_SIZE + Math.floor(WORLD_CELL_SIZE / 2);
          const idx = (py * WORLD_MAP_WIDTH + px) * 4;

          const r = imageData.data[idx];
          const g = imageData.data[idx + 1];
          const b = imageData.data[idx + 2];
          const a = imageData.data[idx + 3];

          // Skip transparent (ocean) pixels
          if (a < 128) continue;

          const color = (r << 16) | (g << 8) | b;

          // Check visited mask (red channel — white fill = 255)
          const visited = visitedImageData
            ? visitedImageData.data[idx] > 128
            : false;

          cells.push({ col, color, row, ...(visited && { visited: true }) });
        }
      }

      // ── Canvas 2: Stroke country boundaries ──
      const borderCanvas = new OffscreenCanvas(
        WORLD_MAP_WIDTH,
        WORLD_MAP_HEIGHT,
      );
      const borderCtx = borderCanvas.getContext("2d");
      const boundaryPixels: BoundaryPixel[] = [];

      if (borderCtx) {
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

        const borderImageData = borderCtx.getImageData(
          0,
          0,
          WORLD_MAP_WIDTH,
          WORLD_MAP_HEIGHT,
        );

        // Build a set of land cells for fast lookup (numeric key: row * cols + col)
        const landSet = new Set<number>(
          cells.map((c: ColoredPixelCell) => c.row * cols + c.col),
        );

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (!landSet.has(row * cols + col)) continue;

            const px = col * WORLD_CELL_SIZE + Math.floor(WORLD_CELL_SIZE / 2);
            const py = row * WORLD_CELL_SIZE + Math.floor(WORLD_CELL_SIZE / 2);
            const idx = (py * WORLD_MAP_WIDTH + px) * 4;

            // Green channel > 0 → boundary stroke
            if (borderImageData.data[idx + 1] > 0) {
              boundaryPixels.push({ col, row });
            }
          }
        }
      }

      // ── Markers: project centroids for visited countries ──
      const markers: ProjectedCountryMarker[] = [];

      for (const entry of COUNTRY_BIOMES) {
        if (!entry.visited) continue;

        // Find the matching GeoJSON feature by ISO numeric id
        const countryFeature = countries.features.find(
          (f) => f.id?.toString() === entry.id,
        );
        if (!countryFeature) continue;

        const centroid = geoCentroid(countryFeature);
        const projected = projection(centroid);
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

      if (!cancelled) {
        setResult({ boundaryPixels, cells, cols, markers, rows });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
