import { ZOOM_STEP } from "./constants";

/**
 * Below this many device pixels per cell a zoom step (1/k) is over 25%,
 * which feels like a jump rather than a zoom, so zoom stays continuous there
 * and accepts uneven gaps while zoomed.
 */
const MIN_QUANTIZED_CELL_DEVICE_PIXELS = 4;

/**
 * Zoom follows the wheel continuously while it moves, and settles on a
 * whole-pixel level (settleZoom) this long after the last event. Snapping
 * every frame made zoom step in 14–25% jumps and ignore small wheel deltas
 * until they added up to half a step.
 */
export const ZOOM_SETTLE_MS = 150;

/** WheelEvent.deltaMode line/page units, converted to pixel-mode deltas. */
const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 800;

/**
 * Device pixels one map cell spans at zoom 1, or null when zoom should not
 * be quantized: the canvas width could not be snapped (not a whole number),
 * or a cell is too small for fine steps (see MIN_QUANTIZED_CELL_DEVICE_PIXELS).
 * `cellSize` is the cell pitch in logical px, `resolution` the renderer's.
 */
export function cellDevicePixels(
  cellSize: number,
  resolution: number | undefined,
): null | number {
  if (resolution === undefined) return null;
  const pixels = cellSize * resolution;
  const whole = Math.round(pixels);
  if (Math.abs(pixels - whole) > 1e-6) return null;
  return whole >= MIN_QUANTIZED_CELL_DEVICE_PIXELS ? whole : null;
}

/**
 * Round a zoom level to a level m / cellDevicePx, so a zoomed cell spans m
 * whole device pixels and the 1px gaps stay even. `direction` picks the
 * level: "nearest", or "in"/"out" to round in the direction the wheel was
 * moving, so a single notch always lands at least one level further instead
 * of snapping back. With null, or when [min, max] contains no such level,
 * it only clamps.
 */
export function quantizeZoom(
  zoom: number,
  cellDevicePx: null | number,
  min: number,
  max: number,
  direction: "in" | "nearest" | "out" = "nearest",
): number {
  const clamped = Math.max(min, Math.min(max, zoom));
  if (
    cellDevicePx === null ||
    !Number.isInteger(cellDevicePx) ||
    cellDevicePx <= 0
  ) {
    return clamped;
  }
  const lowest = Math.ceil(min * cellDevicePx);
  const highest = Math.floor(max * cellDevicePx);
  if (lowest > highest) return clamped;
  const exact = clamped * cellDevicePx;
  // Tolerate float noise so an already-whole level does not move a step.
  const step =
    direction === "in"
      ? Math.ceil(exact - 1e-9)
      : direction === "out"
        ? Math.floor(exact + 1e-9)
        : Math.round(exact);
  return Math.max(lowest, Math.min(highest, step)) / cellDevicePx;
}

/** Where a wheel gesture began: the level it was heading to, and the zoom on screen. */
export interface GestureStart {
  /** Whole-pixel level at rest or still being animated toward */
  level: number;
  /** Zoom displayed when the gesture's first event arrived */
  shown: number;
}

/**
 * Where a wheel gesture comes to rest, judged by its net movement from the
 * zoom on screen when it began (not the last event, so mixed in/out bursts
 * neither gain nor lose a level):
 *
 * - Moved in: the nearest whole-pixel level, but at least the first level
 *   above the zoom on screen (one notch is often less than half a level, and
 *   must not snap back), and at least the pending level when an earlier
 *   zoom-in was still animating toward it.
 * - Moved out: the same, mirrored.
 * - No net movement: the pending level.
 */
export function settleZoom(
  raw: number,
  start: GestureStart,
  cellDevicePx: null | number,
  min: number,
  max: number,
): number {
  if (cellDevicePx === null) return quantizeZoom(raw, null, min, max);
  const nearest = quantizeZoom(raw, cellDevicePx, min, max);
  if (raw === start.shown) {
    return quantizeZoom(start.level, cellDevicePx, min, max);
  }
  // Levels are m/k; tolerate float noise so a zoom already on a level counts
  // as that level.
  const onScreen = start.shown * cellDevicePx;
  if (raw > start.shown) {
    const above = (Math.floor(onScreen + 1e-9) + 1) / cellDevicePx;
    const floor = Math.max(above, start.level);
    return quantizeZoom(Math.max(nearest, floor), cellDevicePx, min, max);
  }
  const below = (Math.ceil(onScreen - 1e-9) - 1) / cellDevicePx;
  const ceiling = Math.min(below, start.level);
  return quantizeZoom(Math.min(nearest, ceiling), cellDevicePx, min, max);
}

/** Multiplicative zoom factor for one wheel event, independent of deltaMode. */
export function wheelZoomFactor(event: WheelEvent): number {
  const unit =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? LINE_HEIGHT_PX
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? PAGE_HEIGHT_PX
        : 1;
  // ~100px per notch of a typical mouse wheel -> one ZOOM_STEP.
  return Math.pow(ZOOM_STEP, (-event.deltaY * unit) / 100);
}
