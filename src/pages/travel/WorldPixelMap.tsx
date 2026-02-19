import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import type { WorldPixelGridResult } from "./types";
import {
  COLOR_WORLD_BG_DOT,
  COLOR_WORLD_BORDER,
  WORLD_CELL_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./constants";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

/* ── Sub-components ── */

function LandGrid({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const cell of grid.cells) {
        const x = cell.col * WORLD_CELL_SIZE;
        const y = cell.row * WORLD_CELL_SIZE;
        g.rect(x, y, WORLD_CELL_SIZE - 1, WORLD_CELL_SIZE - 1).fill(cell.color);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} />;
}

function CountryBorders({ grid }: { grid: WorldPixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const cell of grid.boundaryPixels) {
        const x = cell.col * WORLD_CELL_SIZE;
        const y = cell.row * WORLD_CELL_SIZE;
        g.rect(x, y, WORLD_CELL_SIZE - 1, WORLD_CELL_SIZE - 1).fill({
          alpha: 0.4,
          color: COLOR_WORLD_BORDER,
        });
      }
    },
    [grid],
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

/* ── Props ── */
interface WorldPixelMapProps {
  grid: WorldPixelGridResult;
}

/* ── Main component ── */
export default function WorldPixelMap({ grid }: WorldPixelMapProps) {
  return (
    <Application
      antialias={false}
      backgroundColor={0xfa_fa_f9}
      height={WORLD_MAP_HEIGHT}
      resolution={window.devicePixelRatio}
      width={WORLD_MAP_WIDTH}
    >
      <BackgroundGrid />
      <LandGrid grid={grid} />
      <CountryBorders grid={grid} />
    </Application>
  );
}
