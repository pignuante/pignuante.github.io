import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ZOOM_MAX, ZOOM_MIN } from "./constants";
import {
  quantizeZoom,
  settleZoom,
  wheelZoomFactor,
  ZOOM_SETTLE_MS,
} from "./zoomMath";

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
 * - With `baseCellDevicePixels`, zoom follows the wheel continuously and,
 *   ZOOM_SETTLE_MS after the last event, settles on a level where a cell
 *   spans whole device pixels (settleZoom: nearest, or one level on when the
 *   nearest is where the gesture began), so the grid is even at rest.
 *
 * @param targetRef - Ref to the DOM element that captures wheel events
 * @param baseCellDevicePixels - Device px per cell at zoom 1, or null to zoom freely
 */
export function useZoom(
  targetRef: RefObject<HTMLDivElement | null>,
  baseCellDevicePixels: null | number = null,
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
  /** Wheel accumulator; continuous during a gesture, the level at rest */
  const rawGoalRef = useRef(1);
  /** Pending settle-to-whole-pixel timer (0 = none) */
  const settleTimerRef = useRef(0);
  /** Level the current wheel gesture started from (null between gestures) */
  const gestureStartRef = useRef<null | number>(null);
  const baseCellDevicePixelsRef = useRef(baseCellDevicePixels);

  useEffect(() => {
    baseCellDevicePixelsRef.current = baseCellDevicePixels;
    // Re-snap the current goal when the cell size changes (resize, DPR).
    // Cancel a pending settle and restart the accumulator from the new level,
    // so neither a stale timer nor the old raw value overrides it.
    window.clearTimeout(settleTimerRef.current);
    gestureStartRef.current = null;
    const snapped = quantizeZoom(
      rawGoalRef.current,
      baseCellDevicePixels,
      ZOOM_MIN,
      ZOOM_MAX,
    );
    if (snapped !== goalRef.current) {
      goalRef.current = snapped;
      rawGoalRef.current = snapped;
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      }
    }
  }, [baseCellDevicePixels]);

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

  /** Bring the zoom to rest on a whole-pixel level (see settleZoom). */
  const settle = useCallback((): void => {
    const start = gestureStartRef.current ?? rawGoalRef.current;
    gestureStartRef.current = null;
    const settled = settleZoom(
      rawGoalRef.current,
      start,
      baseCellDevicePixelsRef.current,
      ZOOM_MIN,
      ZOOM_MAX,
    );
    rawGoalRef.current = settled;
    goalRef.current = settled;
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Proportional zoom: ~100px per mouse-wheel notch, ~1-10 for trackpad
      const factor = wheelZoomFactor(e);
      if (gestureStartRef.current === null) {
        // New gesture: remember the level it starts from (for settleZoom),
        // and accumulate from what is on screen, not from a settle target
        // the animation has not reached yet; otherwise reversing direction
        // mid-settle would keep zooming the old way for a moment.
        gestureStartRef.current = rawGoalRef.current;
        rawGoalRef.current = currentRef.current;
      }
      rawGoalRef.current = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, rawGoalRef.current * factor),
      );
      // Follow the wheel continuously; settle on a whole-pixel level once it
      // stops (see ZOOM_SETTLE_MS).
      goalRef.current = rawGoalRef.current;
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(settle, ZOOM_SETTLE_MS);

      // Start animation loop if not already running
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      }
    },
    [settle],
  );

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // passive: false is required for preventDefault() to work on wheel
    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleTimerRef.current);
    };
  }, [targetRef, handleWheel]);

  return { zoom };
}
