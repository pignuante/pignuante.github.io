import type { FederatedPointerEvent } from "pixi.js";
import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import type { ProjectedCountryMarker, WorldPixelGridResult } from "./types";
import {
  COLOR_GLOBE_OCEAN,
  COLOR_GLOBE_OUTLINE,
  COLOR_MARKER_INNER,
  COLOR_MARKER_OUTER,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BG_DOT,
  COLOR_WORLD_BORDER,
  GLOBE_CELL_SIZE,
  GLOBE_SIZE,
  MARKER_DOT_INNER_RADIUS,
  MARKER_DOT_RADIUS,
  MARKER_HIT_RADIUS_MULTIPLIER,
  VISITED_OVERLAY_ALPHA,
} from "./constants";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

/** Squared hit-test radius for marker detection */
const HIT_RADIUS_SQ = (MARKER_DOT_RADIUS * MARKER_HIT_RADIUS_MULTIPLIER) ** 2;

/** Globe center coordinate (half of GLOBE_SIZE) */
const HALF = GLOBE_SIZE / 2;

/* ── Sub-components ── */

function GlobeBackground() {
  const draw = useCallback((g: Graphics) => {
    g.clear();

    // Background dot grid (every 8px, 0.5 radius, 15% alpha)
    for (let x = 0; x < GLOBE_SIZE; x += 8) {
      for (let y = 0; y < GLOBE_SIZE; y += 8) {
        g.circle(x, y, 0.5).fill({ alpha: 0.15, color: COLOR_WORLD_BG_DOT });
      }
    }

    // Filled ocean circle
    g.circle(HALF, HALF, HALF).fill(COLOR_GLOBE_OCEAN);
  }, []);

  return <pixiGraphics draw={draw} />;
}

function GlobeOceanGrid({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!grid.oceanCells) return;

      const cellW = GLOBE_CELL_SIZE - 1;
      for (const cell of grid.oceanCells) {
        const x = cell.col * GLOBE_CELL_SIZE;
        const y = cell.row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(cell.color);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} />;
}

function GlobeLandGrid({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = GLOBE_CELL_SIZE - 1;
      for (const cell of grid.cells) {
        const x = cell.col * GLOBE_CELL_SIZE;
        const y = cell.row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(cell.color);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} />;
}

function GlobeVisitedOverlay({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = GLOBE_CELL_SIZE - 1;
      const fill = { alpha: VISITED_OVERLAY_ALPHA, color: COLOR_VISITED_TINT };

      for (const cell of grid.cells) {
        if (!cell.visited) continue;

        const x = cell.col * GLOBE_CELL_SIZE;
        const y = cell.row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(fill);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} />;
}

function GlobeBorders({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = GLOBE_CELL_SIZE - 1;
      const fill = { alpha: 0.4, color: COLOR_WORLD_BORDER };

      for (const cell of grid.boundaryPixels) {
        const x = cell.col * GLOBE_CELL_SIZE;
        const y = cell.row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(fill);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} />;
}

function GlobeMarkers({
  markers,
  onHover,
  zoom,
}: {
  markers: ProjectedCountryMarker[];
  onHover: (marker: ProjectedCountryMarker | null) => void;
  zoom: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const m of markers) {
        // Outer ring
        g.circle(m.x, m.y, MARKER_DOT_RADIUS).fill(COLOR_MARKER_OUTER);
        // Inner dot
        g.circle(m.x, m.y, MARKER_DOT_INNER_RADIUS).fill(COLOR_MARKER_INNER);
      }
    },
    [markers],
  );

  const handlePointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      // Transform stage coordinates → local (inside zoomed container)
      const localX = (e.global.x - HALF) / zoom + HALF;
      const localY = (e.global.y - HALF) / zoom + HALF;

      const hit = markers.find((m) => {
        const dx = m.x - localX;
        const dy = m.y - localY;
        return dx * dx + dy * dy <= HIT_RADIUS_SQ;
      });

      onHover(hit ?? null);
    },
    [markers, onHover, zoom],
  );

  const handlePointerLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <pixiGraphics
      draw={draw}
      eventMode="static"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    />
  );
}

function GlobeOutline() {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    g.circle(HALF, HALF, HALF - 0.5).stroke({
      color: COLOR_GLOBE_OUTLINE,
      width: 1,
    });
  }, []);

  return <pixiGraphics draw={draw} />;
}

/* ── Props ── */
interface GlobePixelMapProps {
  grid: WorldPixelGridResult;
  onMarkerHover?: (marker: ProjectedCountryMarker | null) => void;
  zoom?: number;
}

/* ── Main component ── */
export default function GlobePixelMap({
  grid,
  onMarkerHover,
  zoom = 1,
}: GlobePixelMapProps) {
  const handleHover = useCallback(
    (marker: ProjectedCountryMarker | null) => {
      onMarkerHover?.(marker);
    },
    [onMarkerHover],
  );

  return (
    <Application
      antialias={false}
      backgroundColor={0xfa_fa_f9}
      height={GLOBE_SIZE}
      resolution={window.devicePixelRatio}
      width={GLOBE_SIZE}
    >
      <pixiContainer
        pivot={{ x: HALF, y: HALF }}
        scale={zoom}
        x={HALF}
        y={HALF}
      >
        <GlobeBackground />
        <GlobeOceanGrid grid={grid} />
        <GlobeLandGrid grid={grid} />
        <GlobeVisitedOverlay grid={grid} />
        <GlobeBorders grid={grid} />
        <GlobeMarkers
          markers={grid.markers}
          onHover={handleHover}
          zoom={zoom}
        />
        <GlobeOutline />
      </pixiContainer>
    </Application>
  );
}
