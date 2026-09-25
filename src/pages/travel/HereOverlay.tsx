import type { Graphics } from "pixi.js";
import { useTick } from "@pixi/react";
import { useCallback, useRef } from "react";
import type { WorldPixelGridResult } from "./types";
import {
  COLOR_HERE,
  COLOR_HERE_HIGHLIGHT,
  COLOR_HERE_OUTLINE,
} from "./constants";
import { PIN_ROWS } from "./herePin";
import { wrapX } from "./utils";

/** Where the visitor pin goes, in the map's logical stage coordinates. */
export interface HereMarker {
  /** 1-based world-grid country index to tint, 0 for none (open ocean) */
  countryIndex: number;
  /** Pin tip; null when the point is not visible (far side of the globe) */
  point: null | { x: number; y: number };
}

/** Country tint opacity range; it breathes between the two unless motion is reduced */
const TINT_ALPHA = { max: 0.42, min: 0.16 };
/** One full breath of the tint, in ms */
const TINT_PERIOD_MS = 1600;

function drawPin(
  g: Graphics,
  tipX: number,
  tipY: number,
  pinPixel: number,
): void {
  const width = PIN_ROWS[0].length * pinPixel;
  const left = Math.round(tipX - width / 2);
  const top = Math.round(tipY - PIN_ROWS.length * pinPixel);
  const color = {
    F: COLOR_HERE,
    H: COLOR_HERE_HIGHLIGHT,
    O: COLOR_HERE_OUTLINE,
  };
  PIN_ROWS.forEach((row, r) => {
    [...row].forEach((cell, c) => {
      if (cell === ".") return;
      g.rect(left + c * pinPixel, top + r * pinPixel, pinPixel, pinPixel).fill(
        color[cell as keyof typeof color],
      );
    });
  });
}

interface HereOverlayProps {
  cellSize: number;
  grid: WorldPixelGridResult;
  here: HereMarker | null;
  /** Horizontal wrap width for the endless flat map; omit on the globe */
  mapWidth?: number;
  offsetX?: number;
  /** Logical px per pin pixel (see pinPixelSize) */
  pinPixel: number;
  /** Animate the tint; false for prefers-reduced-motion */
  pulse: boolean;
}

/**
 * "You are here": tints the visitor's country and draws a pixel pin at the
 * time-zone city (or the precise position). Purely local; nothing is stored.
 */
export function HereOverlay({
  cellSize,
  grid,
  here,
  mapWidth,
  offsetX = 0,
  pinPixel,
  pulse,
}: HereOverlayProps) {
  // The tint's opacity is animated on the Pixi ticker, not through React
  // state, so the pulse never re-renders the page (or runs setState during a
  // drag, which hangs WebKit; see main.tsx).
  const tintRef = useRef<Graphics | null>(null);
  useTick(() => {
    const tint = tintRef.current;
    if (!tint) return;
    if (!pulse) {
      tint.alpha = TINT_ALPHA.max;
      return;
    }
    const phase =
      (Math.sin((performance.now() / TINT_PERIOD_MS) * 2 * Math.PI) + 1) / 2;
    tint.alpha = TINT_ALPHA.min + (TINT_ALPHA.max - TINT_ALPHA.min) * phase;
  });

  const drawTint = useCallback(
    (g: Graphics) => {
      g.clear();
      if (!here || here.countryIndex <= 0) return;
      const cellW = cellSize - 1;
      const { cols, screenCountry } = grid;
      for (let idx = 0; idx < screenCountry.length; idx++) {
        if (screenCountry[idx] !== here.countryIndex) continue;
        const y = Math.floor(idx / cols) * cellSize;
        const x = (idx % cols) * cellSize;
        if (mapWidth === undefined) {
          g.rect(x, y, cellW, cellW).fill(COLOR_HERE);
          continue;
        }
        const wx = wrapX(x + offsetX, mapWidth);
        g.rect(wx, y, cellW, cellW).fill(COLOR_HERE);
        if (wx + cellSize > mapWidth) {
          g.rect(wx - mapWidth, y, cellW, cellW).fill(COLOR_HERE);
        }
      }
    },
    [cellSize, grid, here, mapWidth, offsetX],
  );

  const drawPinLayer = useCallback(
    (g: Graphics) => {
      g.clear();
      if (!here?.point) return;
      const { x, y } = here.point;
      if (mapWidth === undefined) {
        drawPin(g, x, y, pinPixel);
        return;
      }
      const half = (PIN_ROWS[0].length * pinPixel) / 2;
      const wx = wrapX(x + offsetX, mapWidth);
      drawPin(g, wx, y, pinPixel);
      // Draw the wrapped copy when the pin straddles the seam.
      if (wx + half > mapWidth) drawPin(g, wx - mapWidth, y, pinPixel);
      if (wx - half < 0) drawPin(g, wx + mapWidth, y, pinPixel);
    },
    [here, mapWidth, offsetX, pinPixel],
  );

  return (
    <>
      <pixiGraphics draw={drawTint} ref={tintRef} />
      <pixiGraphics draw={drawPinLayer} />
    </>
  );
}
