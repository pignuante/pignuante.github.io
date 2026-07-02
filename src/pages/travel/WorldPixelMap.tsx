import type { FederatedPointerEvent } from "pixi.js";
import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import type { CountryHoverInfo, WorldPixelGridResult } from "./types";
import {
  COLOR_HOVER_BORDER,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BG_DOT,
  COLOR_WORLD_BORDER,
  HOVER_BORDER_ALPHA,
  HOVER_OVERLAY_ALPHA,
  HOVER_SEARCH_RADIUS,
  VISITED_OVERLAY_ALPHA,
  WORLD_CELL_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./constants";
import { wrapX } from "./utils";
import { COUNTRY_BIOME_MAP } from "./world-data";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

/* ── Zoom pivot (center of canvas) ── */
const PIVOT_X = WORLD_MAP_WIDTH / 2;
const PIVOT_Y = WORLD_MAP_HEIGHT / 2;

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
  hoveredCountryId,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  hoveredCountryId: string | null;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = WORLD_CELL_SIZE - 1;
      const normalFill = {
        alpha: VISITED_OVERLAY_ALPHA,
        color: COLOR_VISITED_TINT,
      };
      const hoverFill = {
        alpha: HOVER_OVERLAY_ALPHA,
        color: COLOR_VISITED_TINT,
      };
      const countryGrid = grid.visitedCountryGrid;

      for (const cell of grid.cells) {
        if (!cell.visited) continue;

        const flatIdx = cell.row * grid.cols + cell.col;
        const cellCountryId = countryGrid?.get(flatIdx);
        const isHovered =
          cellCountryId === hoveredCountryId && hoveredCountryId !== null;
        const fill = isHovered ? hoverFill : normalFill;

        const origX = cell.col * WORLD_CELL_SIZE;
        const wx = wrapX(origX + offsetX, WORLD_MAP_WIDTH);
        const y = cell.row * WORLD_CELL_SIZE;

        g.rect(wx, y, cellW, cellW).fill(fill);

        if (wx + WORLD_CELL_SIZE > WORLD_MAP_WIDTH) {
          g.rect(wx - WORLD_MAP_WIDTH, y, cellW, cellW).fill(fill);
        }
      }
    },
    [grid, hoveredCountryId, offsetX],
  );

  return <pixiGraphics draw={draw} />;
}

/**
 * Pixel-art border outline around hovered country.
 * Draws border cells where a hovered-country cell has a neighbor
 * that does NOT belong to the same country.
 */
function HoverBorder({
  grid,
  hoveredCountryId,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  hoveredCountryId: string | null;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!hoveredCountryId || !grid.visitedCountryGrid) return;

      const cellW = WORLD_CELL_SIZE - 1;
      const fill = { alpha: HOVER_BORDER_ALPHA, color: COLOR_HOVER_BORDER };
      const { cols } = grid;
      const countryGrid = grid.visitedCountryGrid;
      const rows = grid.rows;

      // 4-directional neighbor offsets: [dRow, dCol]
      const DIRS: ReadonlyArray<readonly [number, number]> = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [flatIdx, countryId] of countryGrid) {
        if (countryId !== hoveredCountryId) continue;

        const row = Math.floor(flatIdx / cols);
        const col = flatIdx % cols;

        // Check if any neighbor is NOT the same country → this is a border cell
        let isBorder = false;
        for (const [dr, dc] of DIRS) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
            isBorder = true;
            break;
          }
          if (countryGrid.get(nr * cols + nc) !== hoveredCountryId) {
            isBorder = true;
            break;
          }
        }

        if (!isBorder) continue;

        const origX = col * WORLD_CELL_SIZE;
        const wx = wrapX(origX + offsetX, WORLD_MAP_WIDTH);
        const y = row * WORLD_CELL_SIZE;

        g.rect(wx, y, cellW, cellW).fill(fill);

        if (wx + WORLD_CELL_SIZE > WORLD_MAP_WIDTH) {
          g.rect(wx - WORLD_MAP_WIDTH, y, cellW, cellW).fill(fill);
        }
      }
    },
    [grid, hoveredCountryId, offsetX],
  );

  return <pixiGraphics draw={draw} />;
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

function OceanGrid({
  grid,
  offsetX,
}: {
  grid: WorldPixelGridResult;
  offsetX: number;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!grid.oceanCells) return;

      const cellW = WORLD_CELL_SIZE - 1;
      for (const cell of grid.oceanCells) {
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

/**
 * Invisible interaction layer for country hover detection.
 * Covers the full canvas, receives pointer events, and resolves
 * which visited country (if any) is under the cursor.
 */
function HoverDetector({
  grid,
  offsetX,
  offsetY,
  onCountryHover,
  zoom,
}: {
  grid: WorldPixelGridResult;
  offsetX: number;
  offsetY: number;
  onCountryHover: (info: CountryHoverInfo | null) => void;
  zoom: number;
}) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    // Transparent hit area covering full canvas
    g.rect(0, 0, WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT).fill({
      alpha: 0.001,
      color: 0x000000,
    });
  }, []);

  const handlePointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      if (!grid.visitedCountryGrid) {
        onCountryHover(null);
        return;
      }

      // Transform stage coordinates → local (inside zoomed container)
      const pivotY = PIVOT_Y + offsetY;
      const localX = (e.global.x - PIVOT_X) / zoom + PIVOT_X;
      const localY = (e.global.y - pivotY) / zoom + pivotY;

      // Unwrap pointer position back to original map-space
      const mapX = wrapX(localX - offsetX, WORLD_MAP_WIDTH);

      // Convert to cell coordinates
      const col = Math.floor(mapX / WORLD_CELL_SIZE);
      const row = Math.floor(localY / WORLD_CELL_SIZE);

      if (col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) {
        onCountryHover(null);
        return;
      }

      const flatIdx = row * grid.cols + col;
      let countryId = grid.visitedCountryGrid.get(flatIdx);

      // Fuzzy search: if direct hit misses, scan nearby cells for small countries
      if (!countryId) {
        let nearestDistSq = Infinity;
        for (let dr = -HOVER_SEARCH_RADIUS; dr <= HOVER_SEARCH_RADIUS; dr++) {
          for (let dc = -HOVER_SEARCH_RADIUS; dc <= HOVER_SEARCH_RADIUS; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols)
              continue;
            const nId = grid.visitedCountryGrid.get(nr * grid.cols + nc);
            if (nId) {
              const dSq = dr * dr + dc * dc;
              if (dSq < nearestDistSq) {
                nearestDistSq = dSq;
                countryId = nId;
              }
            }
          }
        }
      }

      if (!countryId) {
        onCountryHover(null);
        return;
      }

      const entry = COUNTRY_BIOME_MAP.get(countryId);
      if (!entry) {
        onCountryHover(null);
        return;
      }

      onCountryHover({
        id: countryId,
        name: entry.name,
        nameKo: entry.nameKo,
        stageX: e.global.x,
        stageY: e.global.y,
      });
    },
    [grid, offsetX, offsetY, onCountryHover, zoom],
  );

  const handlePointerLeave = useCallback(() => {
    onCountryHover(null);
  }, [onCountryHover]);

  return (
    <pixiGraphics
      draw={draw}
      eventMode="static"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    />
  );
}

/* ── Props ── */
interface WorldPixelMapProps {
  grid: WorldPixelGridResult;
  hoveredCountryId?: string | null;
  offsetX?: number;
  offsetY?: number;
  onCountryHover?: (info: CountryHoverInfo | null) => void;
  zoom?: number;
}

/* ── Main component ── */
export default function WorldPixelMap({
  grid,
  hoveredCountryId = null,
  offsetX = 0,
  offsetY = 0,
  onCountryHover,
  zoom = 1,
}: WorldPixelMapProps) {
  const handleCountryHover = useCallback(
    (info: CountryHoverInfo | null) => {
      onCountryHover?.(info);
    },
    [onCountryHover],
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
        <OceanGrid grid={grid} offsetX={offsetX} />
        <LandGrid grid={grid} offsetX={offsetX} />
        <VisitedOverlay
          grid={grid}
          hoveredCountryId={hoveredCountryId}
          offsetX={offsetX}
        />
        <HoverBorder
          grid={grid}
          hoveredCountryId={hoveredCountryId}
          offsetX={offsetX}
        />
        <CountryBorders grid={grid} offsetX={offsetX} />
        <HoverDetector
          grid={grid}
          offsetX={offsetX}
          offsetY={offsetY}
          onCountryHover={handleCountryHover}
          zoom={zoom}
        />
      </pixiContainer>
    </Application>
  );
}
