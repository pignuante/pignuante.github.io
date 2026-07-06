import { geoOrthographic } from "d3-geo";
import { useEffect, useRef, useState } from "react";
import type { GlobeRotation, WorldPixelGridResult } from "./types";
import { compositeWorldGrid } from "./composite";
import { GLOBE_CELL_SIZE, GLOBE_SIZE } from "./constants";
import { useWorldGridData } from "./useWorldGridData";

const GRID_COLS = Math.floor(GLOBE_SIZE / GLOBE_CELL_SIZE);

/**
 * One screen cell's angular size at the globe center, in degrees.
 * Orthographic: dx = R·dλ at the center, R = GLOBE_SIZE / 2.
 * Scales the pre-baked coast distance to the same falloff the old
 * screen-space BFS produced.
 */
const CELL_ANGULAR_DEG = (GLOBE_CELL_SIZE / (GLOBE_SIZE / 2)) * (180 / Math.PI);

/**
 * Pixel-art globe grid hook.
 *
 * Samples the build-time world grid (see scripts/bake-world-grid.mjs)
 * through an inverse orthographic projection — no vector rasterization.
 * Re-composites on rotation change, throttled to one rAF per update.
 */
export function useGlobePixelGrid(
  rotation: GlobeRotation,
): WorldPixelGridResult | null {
  const data = useWorldGridData();
  const [result, setResult] = useState<WorldPixelGridResult | null>(null);
  const rafRef = useRef<number>(0);

  const lambda = rotation.lambda;
  const phi = rotation.phi;

  useEffect(() => {
    if (!data) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const projection = geoOrthographic()
        .clipAngle(90)
        .rotate([-lambda, -phi, 0])
        .fitSize([GLOBE_SIZE, GLOBE_SIZE], { type: "Sphere" });

      const half = GLOBE_SIZE / 2;
      const radiusSq = half * half;
      const invert = (px: number, py: number): [number, number] | null => {
        // Explicit disc check: d3's clamped asin makes invert return valid
        // (horizon) coordinates even outside the globe circle
        const dx = px - half;
        const dy = py - half;
        if (dx * dx + dy * dy > radiusSq) return null;

        const lonLat = projection.invert?.([px, py]);
        return lonLat &&
          Number.isFinite(lonLat[0]) &&
          Number.isFinite(lonLat[1])
          ? [lonLat[0], lonLat[1]]
          : null;
      };

      setResult(
        compositeWorldGrid({
          cellAngularDeg: CELL_ANGULAR_DEG,
          cellSize: GLOBE_CELL_SIZE,
          cols: GRID_COLS,
          data,
          invert,
          rows: GRID_COLS,
        }),
      );
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [data, lambda, phi]);

  return result;
}
