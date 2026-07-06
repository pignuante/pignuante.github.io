import { geoNaturalEarth1 } from "d3-geo";
import { useEffect, useState } from "react";
import type { WorldPixelGridResult } from "./types";
import { compositeWorldGrid } from "./composite";
import {
  WORLD_CELL_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./constants";
import { useWorldGridData } from "./useWorldGridData";

const GRID_COLS = Math.floor(WORLD_MAP_WIDTH / WORLD_CELL_SIZE);
const GRID_ROWS = Math.floor(WORLD_MAP_HEIGHT / WORLD_CELL_SIZE);

/**
 * Flat world map grid hook.
 *
 * Samples the build-time world grid through an inverse NaturalEarth1
 * projection (fit parameters baked into world-grid-meta.json — identical
 * framing to the old runtime fitExtent). Composites exactly once; panning
 * and zooming are sprite/container transforms in WorldPixelMap.
 */
export function useWorldPixelGrid(): WorldPixelGridResult | null {
  const data = useWorldGridData();
  const [result, setResult] = useState<WorldPixelGridResult | null>(null);

  useEffect(() => {
    if (!data) return;

    // Composite off the commit phase (heavy work + avoids sync setState in effect)
    const raf = requestAnimationFrame(() => {
      const projection = geoNaturalEarth1()
        .scale(data.naturalEarthFit.scale)
        .translate(data.naturalEarthFit.translate);

      const invert = (px: number, py: number): [number, number] | null => {
        const lonLat = projection.invert?.([px, py]);
        // Points outside the map outline invert to out-of-range lon/lat;
        // compositeWorldGrid range-checks and treats them as outside.
        return lonLat ? [lonLat[0], lonLat[1]] : null;
      };

      // One screen cell's angular width at the equator, derived numerically
      // from the fitted projection (≈1.1° for the current framing).
      const equator = projection([0, 0]);
      const shifted = equator
        ? projection.invert?.([equator[0] + WORLD_CELL_SIZE, equator[1]])
        : null;
      const cellAngularDeg = shifted ? Math.abs(shifted[0]) : 1.1;

      setResult(
        compositeWorldGrid({
          cellAngularDeg,
          cellSize: WORLD_CELL_SIZE,
          cols: GRID_COLS,
          data,
          invert,
          rows: GRID_ROWS,
        }),
      );
    });

    return () => cancelAnimationFrame(raf);
  }, [data]);

  return result;
}
