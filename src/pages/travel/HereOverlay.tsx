import type { Container, Graphics } from "pixi.js";
import { useTick } from "@pixi/react";
import { Texture } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { WorldPixelGridResult } from "./types";
import {
  COLOR_HERE,
  COLOR_HERE_HIGHLIGHT,
  COLOR_HERE_OUTLINE,
} from "./constants";
import { PIN_ROWS } from "./herePin";
import { pixiHexToCss, wrapX } from "./utils";

/** Where the visitor pin goes, in the map's logical stage coordinates. */
export interface HereMarker {
  /** 1-based world-grid country index to tint, 0 for none */
  countryIndex: number;
  /** Pin tip; null when the point is not visible (far side of the globe) */
  point: null | { x: number; y: number };
}

/** Country tint opacity range; it breathes between the two unless motion is reduced */
const TINT_ALPHA = { max: 0.42, min: 0.16 };
/** One full breath of the tint, in ms */
const TINT_PERIOD_MS = 1600;

const PIN_COLORS = {
  F: COLOR_HERE,
  H: COLOR_HERE_HIGHLIGHT,
  O: COLOR_HERE_OUTLINE,
} as const;

function drawPin(
  g: Graphics,
  tipX: number,
  tipY: number,
  pinPixel: number,
): void {
  const width = PIN_ROWS[0].length * pinPixel;
  const left = tipX - width / 2;
  const top = tipY - PIN_ROWS.length * pinPixel;
  PIN_ROWS.forEach((row, r) => {
    [...row].forEach((cell, c) => {
      if (cell === ".") return;
      g.rect(left + c * pinPixel, top + r * pinPixel, pinPixel, pinPixel).fill(
        PIN_COLORS[cell as keyof typeof PIN_COLORS],
      );
    });
  });
}

/** One opaque layer with the visitor country's cells, baked once per grid. */
function useTintTexture(
  grid: WorldPixelGridResult,
  countryIndex: number,
  cellSize: number,
): null | Texture {
  const texture = useMemo(() => {
    if (countryIndex <= 0) return null;
    const { cols, rows, screenCountry } = grid;
    const canvas = new OffscreenCanvas(cols * cellSize, rows * cellSize);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = pixiHexToCss(COLOR_HERE);
    const cellW = cellSize - 1;
    let cells = 0;
    for (let idx = 0; idx < screenCountry.length; idx++) {
      if (screenCountry[idx] !== countryIndex) continue;
      ctx.fillRect(
        (idx % cols) * cellSize,
        Math.floor(idx / cols) * cellSize,
        cellW,
        cellW,
      );
      cells++;
    }
    if (cells === 0) return null;
    const t = Texture.from(canvas);
    t.source.scaleMode = "nearest";
    return t;
  }, [cellSize, countryIndex, grid]);

  useEffect(() => () => texture?.destroy(true), [texture]);
  return texture;
}

interface HereOverlayProps {
  cellSize: number;
  grid: WorldPixelGridResult;
  here: HereMarker | null;
  /** Horizontal wrap width for the endless flat map; omit on the globe */
  mapWidth?: number;
  offsetX?: number;
  /** Logical px per pin pixel at zoom 1 (see pinPixelSize) */
  pinPixel: number;
  /** Animate the tint; false for prefers-reduced-motion */
  pulse: boolean;
  /** Current map zoom; the pin is counter-scaled so it keeps its size */
  zoom: number;
}

/**
 * "You are here": tints the visitor's country and draws a pixel pin at the
 * time-zone city (or the precise position). Purely local; nothing is stored.
 *
 * The tint is baked into one texture (like the map itself) and only moved
 * while panning; its opacity breathes on the Pixi ticker rather than React
 * state, so neither panning nor the pulse re-renders the page or rebuilds
 * cells (and no setState runs during a drag, which hangs WebKit; main.tsx).
 */
export function HereOverlay({
  cellSize,
  grid,
  here,
  mapWidth,
  offsetX = 0,
  pinPixel,
  pulse,
  zoom,
}: HereOverlayProps) {
  const tint = useTintTexture(grid, here?.countryIndex ?? 0, cellSize);
  const tintLayerRef = useRef<Container | null>(null);

  const breathe = useCallback(() => {
    const layer = tintLayerRef.current;
    if (!layer) return;
    const phase =
      (Math.sin((performance.now() / TINT_PERIOD_MS) * 2 * Math.PI) + 1) / 2;
    layer.alpha = TINT_ALPHA.min + (TINT_ALPHA.max - TINT_ALPHA.min) * phase;
  }, []);
  useTick({ callback: breathe, isEnabled: pulse && tint !== null });
  // Without the pulse the tint rests at full strength. (Not an `alpha` prop:
  // every pan re-render would reset the breathing phase.)
  useEffect(() => {
    if (!pulse && tintLayerRef.current) {
      tintLayerRef.current.alpha = TINT_ALPHA.max;
    }
  }, [pulse, tint]);

  const drawPinLayer = useCallback(
    (g: Graphics) => {
      g.clear();
      if (!here?.point) return;
      // Counter the zoom container so the pin keeps its on-screen size.
      const size = pinPixel / zoom;
      const { x, y } = here.point;
      if (mapWidth === undefined) {
        drawPin(g, x, y, size);
        return;
      }
      const half = (PIN_ROWS[0].length * size) / 2;
      const wx = wrapX(x + offsetX, mapWidth);
      drawPin(g, wx, y, size);
      // Draw the wrapped copy when the pin straddles the seam.
      if (wx + half > mapWidth) drawPin(g, wx - mapWidth, y, size);
      if (wx - half < 0) drawPin(g, wx + mapWidth, y, size);
    },
    [here, mapWidth, offsetX, pinPixel, zoom],
  );

  const tintX = mapWidth === undefined ? 0 : wrapX(offsetX, mapWidth);

  return (
    <>
      {tint ? (
        <pixiContainer ref={tintLayerRef}>
          <pixiSprite texture={tint} x={tintX} />
          {mapWidth === undefined ? null : (
            <pixiSprite texture={tint} x={tintX - mapWidth} />
          )}
        </pixiContainer>
      ) : null}
      <pixiGraphics draw={drawPinLayer} />
    </>
  );
}
