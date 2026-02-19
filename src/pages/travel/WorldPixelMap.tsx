import type { FederatedPointerEvent } from "pixi.js";
import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import type { ProjectedCountryMarker, WorldPixelGridResult } from "./types";
import {
  COLOR_MARKER_INNER,
  COLOR_MARKER_OUTER,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BG_DOT,
  COLOR_WORLD_BORDER,
  MARKER_DOT_INNER_RADIUS,
  MARKER_DOT_RADIUS,
  MARKER_HIT_RADIUS_MULTIPLIER,
  VISITED_OVERLAY_ALPHA,
  WORLD_CELL_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./constants";
import { wrapX } from "./utils";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

/** Squared hit-test radius for marker detection */
const HIT_RADIUS_SQ = (MARKER_DOT_RADIUS * MARKER_HIT_RADIUS_MULTIPLIER) ** 2;

/* ── Sub-components ── */

function LandGrid({
  grid,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = WORLD_CELL_SIZE - 1;
      for (const cell of grid.cells) {
        const origX = cell.col * WORLD_CELL_SIZE;
        const wx = wrapX(origX + offsetX, WORLD_MAP_WIDTH);
        const y = cell.row * WORLD_CELL_SIZE;

        g.rect(wx, y, cellW, cellW).fill(cell.color);

        // If cell straddles the right edge, draw a wrapped copy on the left
        if (wx + WORLD_CELL_SIZE > WORLD_MAP_WIDTH) {
          g.rect(wx - WORLD_MAP_WIDTH, y, cellW, cellW).fill(cell.color);
        }
      }
    },
    [grid, offsetX],
  );

  return <pixiGraphics draw={draw} />;
}

function CountryBorders({
  grid,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = WORLD_CELL_SIZE - 1;
      const fill = { alpha: 0.4, color: COLOR_WORLD_BORDER };

      for (const cell of grid.boundaryPixels) {
        const origX = cell.col * WORLD_CELL_SIZE;
        const wx = wrapX(origX + offsetX, WORLD_MAP_WIDTH);
        const y = cell.row * WORLD_CELL_SIZE;

        g.rect(wx, y, cellW, cellW).fill(fill);

        if (wx + WORLD_CELL_SIZE > WORLD_MAP_WIDTH) {
          g.rect(wx - WORLD_MAP_WIDTH, y, cellW, cellW).fill(fill);
        }
      }
    },
    [grid, offsetX],
  );

  return <pixiGraphics draw={draw} />;
}

function VisitedOverlay({
  grid,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = WORLD_CELL_SIZE - 1;
      const fill = { alpha: VISITED_OVERLAY_ALPHA, color: COLOR_VISITED_TINT };

      for (const cell of grid.cells) {
        if (!cell.visited) continue;

        const origX = cell.col * WORLD_CELL_SIZE;
        const wx = wrapX(origX + offsetX, WORLD_MAP_WIDTH);
        const y = cell.row * WORLD_CELL_SIZE;

        g.rect(wx, y, cellW, cellW).fill(fill);

        if (wx + WORLD_CELL_SIZE > WORLD_MAP_WIDTH) {
          g.rect(wx - WORLD_MAP_WIDTH, y, cellW, cellW).fill(fill);
        }
      }
    },
    [grid, offsetX],
  );

  return <pixiGraphics draw={draw} />;
}

function CountryMarkers({
  markers,
  offsetX,
  offsetY,
  onHover,
  zoom,
}: {
  markers: ProjectedCountryMarker[];
  offsetX: number;
  offsetY: number;
  onHover: (marker: ProjectedCountryMarker | null) => void;
  zoom: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const m of markers) {
        const wx = wrapX(m.x + offsetX, WORLD_MAP_WIDTH);
        // Outer ring
        g.circle(wx, m.y, MARKER_DOT_RADIUS).fill(COLOR_MARKER_OUTER);
        // Inner dot
        g.circle(wx, m.y, MARKER_DOT_INNER_RADIUS).fill(COLOR_MARKER_INNER);
      }
    },
    [markers, offsetX],
  );

  const handlePointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      // Transform stage coordinates → local (inside zoomed container)
      // Account for shifted pivotY from vertical panning
      const pivotY = PIVOT_Y + offsetY;
      const localX = (e.global.x - PIVOT_X) / zoom + PIVOT_X;
      const localY = (e.global.y - pivotY) / zoom + pivotY;

      // Unwrap the pointer position back to original map-space
      const pointerX = wrapX(localX - offsetX, WORLD_MAP_WIDTH);

      const hit = markers.find((m) => {
        const dx = m.x - pointerX;
        const dy = m.y - localY;
        return dx * dx + dy * dy <= HIT_RADIUS_SQ;
      });

      onHover(hit ?? null);
    },
    [markers, offsetX, offsetY, onHover, zoom],
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

function BackgroundGrid() {
  const draw = useCallback((g: Graphics) => {
    g.clear();

    for (let x = 0; x < WORLD_MAP_WIDTH; x += 8) {
      for (let y = 0; y < WORLD_MAP_HEIGHT; y += 8) {
        g.circle(x, y, 0.5).fill({ alpha: 0.15, color: COLOR_WORLD_BG_DOT });
      }
    }
  }, []);

  return <pixiGraphics draw={draw} />;
}

/* ── Zoom pivot (center of canvas) ── */
const PIVOT_X = WORLD_MAP_WIDTH / 2;
const PIVOT_Y = WORLD_MAP_HEIGHT / 2;

/* ── Props ── */
interface WorldPixelMapProps {
  grid: WorldPixelGridResult;
  offsetX?: number;
  offsetY?: number;
  onMarkerHover?: (marker: ProjectedCountryMarker | null) => void;
  zoom?: number;
}

/* ── Main component ── */
export default function WorldPixelMap({
  grid,
  offsetX = 0,
  offsetY = 0,
  onMarkerHover,
  zoom = 1,
}: WorldPixelMapProps) {
  const handleHover = useCallback(
    (marker: ProjectedCountryMarker | null) => {
      onMarkerHover?.(marker);
    },
    [onMarkerHover],
  );

  /** Vertical pivot shifts with pan (horizontal pivot stays fixed — offsetX is content-level) */
  const pivotY = PIVOT_Y + offsetY;

  return (
    <Application
      antialias={false}
      backgroundColor={0xfa_fa_f9}
      height={WORLD_MAP_HEIGHT}
      resolution={window.devicePixelRatio}
      width={WORLD_MAP_WIDTH}
    >
      <pixiContainer
        pivot={{ x: PIVOT_X, y: pivotY }}
        scale={zoom}
        x={PIVOT_X}
        y={pivotY}
      >
        <BackgroundGrid />
        <LandGrid grid={grid} offsetX={offsetX} />
        <VisitedOverlay grid={grid} offsetX={offsetX} />
        <CountryBorders grid={grid} offsetX={offsetX} />
        <CountryMarkers
          markers={grid.markers}
          offsetX={offsetX}
          offsetY={offsetY}
          onHover={handleHover}
          zoom={zoom}
        />
      </pixiContainer>
    </Application>
  );
}
