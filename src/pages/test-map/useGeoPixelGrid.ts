import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { geoMercator, geoPath } from "d3-geo";
import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { CityMarker, PixelCell, PixelGridResult } from "./types";
import {
  CELL_SIZE,
  MAP_HEIGHT,
  MAP_PADDING,
  MAP_WIDTH,
  SWISS_NUMERIC_CODE,
} from "./constants";

// Dynamic import for world-atlas JSON (tree-shakeable, code-split)
async function loadSwissGeoJSON() {
  const topology =
    (await import("world-atlas/countries-50m.json")) as unknown as Topology<{
      countries: GeometryCollection;
    }>;

  const countries = feature(topology, topology.objects.countries);
  const swiss = countries.features.find((f) => f.id === SWISS_NUMERIC_CODE);

  if (!swiss) throw new Error("Switzerland not found in world-atlas data");
  return swiss;
}

// Fetch canton boundaries from static GeoJSON
async function loadCantonBoundaries(): Promise<
  FeatureCollection<MultiPolygon | Polygon>
> {
  const res = await fetch(
    `${import.meta.env.BASE_URL}geo/swiss-cantons.geojson`,
  );
  if (!res.ok) throw new Error(`Failed to load cantons: ${res.status}`);
  return (await res.json()) as FeatureCollection<MultiPolygon | Polygon>;
}

/**
 * Converts GeoJSON → pixel grid via offscreen canvas rasterization.
 *
 * 1. Project Swiss GeoJSON with d3-geo (fitSize to viewport)
 * 2. Fill on offscreen Canvas 2D
 * 3. Sample every CELL_SIZE pixel → land/empty boolean grid
 * 4. Stroke canton boundaries on a second canvas → boundary pixel grid
 * 5. Project city coords through same projection
 */
export function useGeoPixelGrid(
  cities: ReadonlyArray<CityMarker>,
): PixelGridResult | null {
  const [result, setResult] = useState<PixelGridResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [swiss, cantons] = await Promise.all([
        loadSwissGeoJSON(),
        loadCantonBoundaries(),
      ]);

      // ── Projection: fit Switzerland into the map viewport ──
      const innerWidth = MAP_WIDTH - MAP_PADDING * 2;
      const innerHeight = MAP_HEIGHT - MAP_PADDING * 2;

      const projection = geoMercator().fitSize(
        [innerWidth, innerHeight],
        swiss,
      );

      // ── Offscreen Canvas 1: rasterize the country silhouette ──
      const landCanvas = new OffscreenCanvas(innerWidth, innerHeight);
      const landCtx = landCanvas.getContext("2d");
      if (!landCtx) return;

      const landPathGen = geoPath(
        projection,
        landCtx as unknown as CanvasRenderingContext2D,
      );

      landCtx.fillStyle = "#ff0000";
      landCtx.beginPath();
      landPathGen(swiss);
      landCtx.fill();

      // ── Pixel sampling: land cells ──
      const cols = Math.floor(innerWidth / CELL_SIZE);
      const rows = Math.floor(innerHeight / CELL_SIZE);
      const landImageData = landCtx.getImageData(0, 0, innerWidth, innerHeight);
      const cells: PixelCell[] = [];
      // Track land cells in a Set for fast lookup
      const landSet = new Set<string>();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * CELL_SIZE + Math.floor(CELL_SIZE / 2);
          const py = row * CELL_SIZE + Math.floor(CELL_SIZE / 2);
          const idx = (py * innerWidth + px) * 4;

          if (landImageData.data[idx] > 0) {
            cells.push({ col, row });
            landSet.add(`${col},${row}`);
          }
        }
      }

      // ── Offscreen Canvas 2: rasterize canton boundaries ──
      const borderCanvas = new OffscreenCanvas(innerWidth, innerHeight);
      const borderCtx = borderCanvas.getContext("2d");
      const boundaryPixels: PixelCell[] = [];

      if (borderCtx) {
        const borderPathGen = geoPath(
          projection,
          borderCtx as unknown as CanvasRenderingContext2D,
        );

        borderCtx.strokeStyle = "#00ff00";
        borderCtx.lineWidth = 1.5;

        for (const canton of cantons.features) {
          borderCtx.beginPath();
          borderPathGen(canton);
          borderCtx.stroke();
        }

        const borderImageData = borderCtx.getImageData(
          0,
          0,
          innerWidth,
          innerHeight,
        );

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            // Only mark boundary pixels that are also on land
            if (!landSet.has(`${col},${row}`)) continue;

            const px = col * CELL_SIZE + Math.floor(CELL_SIZE / 2);
            const py = row * CELL_SIZE + Math.floor(CELL_SIZE / 2);
            const idx = (py * innerWidth + px) * 4;

            // Green channel > 0 means boundary (we stroked with #00ff00)
            if (borderImageData.data[idx + 1] > 0) {
              boundaryPixels.push({ col, row });
            }
          }
        }
      }

      // ── City projection: convert [lng, lat] → [x, y] ──
      const cityPixels = cities.map((city) => {
        const projected = projection(city.coords);
        return {
          ...city,
          x: projected ? projected[0] : 0,
          y: projected ? projected[1] : 0,
        };
      });

      if (!cancelled) {
        setResult({ boundaryPixels, cells, cityPixels, cols, rows });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cities]);

  return result;
}
