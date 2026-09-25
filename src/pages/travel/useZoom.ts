import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "./constants";
import { quantizeZoom } from "./utils";

/** Return type for the zoom hook */
interface ZoomState {
  zoom: number;
}

/** Lerp factor per frame — exponential ease-out (~80% settled in 170ms at 60fps) */
const LERP_FACTOR = 0.15;

/** Snap threshold — stop animating when close enough to target */
const SNAP_EPSILON = 0.002;

/**
 * Wheel-based smooth zoom hook for PixiJS map containers.
 *
 * - Uses `deltaY` magnitude for proportional zoom (trackpad = tiny increments,
 *   mouse wheel = larger steps)
 * - Animates toward target via `requestAnimationFrame` lerp (exponential ease-out)
 * - Clamped to [ZOOM_MIN, ZOOM_MAX]
 * - Uses `{ passive: false }` for `preventDefault()` — prevents page scroll
 *
 * - With `cellPixels`, the goal snaps to levels where a cell spans whole
 *   device pixels (see quantizeZoom); the wheel still accumulates finely.
 *
 * @param targetRef - Ref to the DOM element that captures wheel events
 * @param cellPixels - Device px per cell at zoom 1, or null to zoom freely
 */
export function useZoom(
  targetRef: RefObject<HTMLDivElement | null>,
  cellPixels: null | number = null,
): ZoomState {
  const [zoom, setZoom] = useState(1);

  /** The zoom level we're animating toward */
  const goalRef = useRef(1);
  /** The current animated zoom level (updated every rAF frame) */
  const currentRef = useRef(1);
  /** Active rAF id (0 = no animation running) */
  const rafRef = useRef(0);
  /** Stable ref to the tick function (set once in useEffect) */
  const tickRef = useRef<() => void>(() => {});
  /** Unquantized wheel accumulator, so small trackpad deltas add up */
  const rawGoalRef = useRef(1);
  const cellPixelsRef = useRef(cellPixels);

  useEffect(() => {
    cellPixelsRef.current = cellPixels;
    // Re-snap the current goal when the cell size changes (resize, DPR).
    const snapped = quantizeZoom(
      rawGoalRef.current,
      cellPixels,
      ZOOM_MIN,
      ZOOM_MAX,
    );
    if (snapped !== goalRef.current) {
      goalRef.current = snapped;
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      }
    }
  }, [cellPixels]);

  // Initialize tick function once — it only accesses stable refs
  useEffect(() => {
    const tick = () => {
      const current = currentRef.current;
      const goal = goalRef.current;
      const diff = goal - current;

      if (Math.abs(diff) < SNAP_EPSILON) {
        currentRef.current = goal;
        setZoom(goal);
        rafRef.current = 0;
        return;
      }

      const next = current + diff * LERP_FACTOR;
      currentRef.current = next;
      setZoom(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = tick;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    // Proportional zoom: deltaY ~100 for mouse wheel, ~1-10 for trackpad
    // Exponent maps scroll magnitude to zoom factor smoothly
    const factor = Math.pow(ZOOM_STEP, -e.deltaY / 100);
    rawGoalRef.current = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, rawGoalRef.current * factor),
    );
    goalRef.current = quantizeZoom(
      rawGoalRef.current,
      cellPixelsRef.current,
      ZOOM_MIN,
      ZOOM_MAX,
    );

    // Start animation loop if not already running
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // passive: false is required for preventDefault() to work on wheel
    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafRef.current);
    };
  }, [targetRef, handleWheel]);

  return { zoom };
}
