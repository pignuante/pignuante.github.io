import type { FederatedPointerEvent } from "pixi.js";
import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import type { CountryHoverInfo, WorldPixelGridResult } from "./types";
import {
  COLOR_GLOBE_OCEAN,
  COLOR_GLOBE_OUTLINE,
  COLOR_HOVER_BORDER,
  COLOR_VISITED_TINT,
  COLOR_WORLD_BG_DOT,
  COLOR_WORLD_BORDER,
  GLOBE_CELL_SIZE,
  GLOBE_SIZE,
  HOVER_BORDER_ALPHA,
  HOVER_OVERLAY_ALPHA,
  HOVER_SEARCH_RADIUS,
  VISITED_OVERLAY_ALPHA,
} from "./constants";
import { COUNTRY_BIOME_MAP } from "./world-data";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

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

function GlobeVisitedOverlay({
  grid,
  hoveredCountryId,
}: {
  grid: WorldPixelGridResult;
  hoveredCountryId: string | null;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const cellW = GLOBE_CELL_SIZE - 1;
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

        const x = cell.col * GLOBE_CELL_SIZE;
        const y = cell.row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(fill);
      }
    },
    [grid, hoveredCountryId],
  );

  return <pixiGraphics draw={draw} />;
}

/**
 * Pixel-art border outline around hovered country on globe.
 */
function GlobeHoverBorder({
  grid,
  hoveredCountryId,
}: {
  grid: WorldPixelGridResult;
  hoveredCountryId: string | null;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!hoveredCountryId || !grid.visitedCountryGrid) return;

      const cellW = GLOBE_CELL_SIZE - 1;
      const fill = { alpha: HOVER_BORDER_ALPHA, color: COLOR_HOVER_BORDER };
      const { cols, rows } = grid;
      const countryGrid = grid.visitedCountryGrid;

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

        const x = col * GLOBE_CELL_SIZE;
        const y = row * GLOBE_CELL_SIZE;
        g.rect(x, y, cellW, cellW).fill(fill);
      }
    },
    [grid, hoveredCountryId],
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

/**
 * Invisible interaction layer for globe country hover detection.
 */
function GlobeHoverDetector({
  grid,
  onCountryHover,
  zoom,
}: {
  grid: WorldPixelGridResult;
  onCountryHover: (info: CountryHoverInfo | null) => void;
  zoom: number;
}) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    // Transparent hit area covering full globe canvas
    g.rect(0, 0, GLOBE_SIZE, GLOBE_SIZE).fill({
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
      const localX = (e.global.x - HALF) / zoom + HALF;
      const localY = (e.global.y - HALF) / zoom + HALF;

      // Convert to cell coordinates
      const col = Math.floor(localX / GLOBE_CELL_SIZE);
      const row = Math.floor(localY / GLOBE_CELL_SIZE);

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
    [grid, onCountryHover, zoom],
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
  hoveredCountryId?: string | null;
  onCountryHover?: (info: CountryHoverInfo | null) => void;
  zoom?: number;
}

/* ── Main component ── */
export default function GlobePixelMap({
  grid,
  hoveredCountryId = null,
  onCountryHover,
  zoom = 1,
}: GlobePixelMapProps) {
  const handleCountryHover = useCallback(
    (info: CountryHoverInfo | null) => {
      onCountryHover?.(info);
    },
    [onCountryHover],
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
        <GlobeVisitedOverlay grid={grid} hoveredCountryId={hoveredCountryId} />
        <GlobeHoverBorder grid={grid} hoveredCountryId={hoveredCountryId} />
        <GlobeBorders grid={grid} />
        <GlobeHoverDetector
          grid={grid}
          onCountryHover={handleCountryHover}
          zoom={zoom}
        />
        <GlobeOutline />
      </pixiContainer>
    </Application>
  );
}
