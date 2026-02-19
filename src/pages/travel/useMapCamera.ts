import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "./constants";

/** Lerp factor per frame — exponential ease-out (~80 % settled in 170 ms @60 fps) */
const LERP_FACTOR = 0.15;

/** Snap threshold — stop animating when close enough to target */
const SNAP_EPSILON = 0.002;

/* ── Types ── */

interface MapCameraState {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  zoom: number;
}

/** Anchor captured on each wheel event for mouse-position zoom */
interface ZoomAnchor {
  /** Content-space Y under cursor (computed once, used every rAF frame) */
  contentY: number;
  /** offsetX snapshot at the moment the anchor was captured */
  offsetXAtCapture: number;
  /** Logical canvas X of the cursor */
  screenX: number;
  /** Logical canvas Y of the cursor */
  screenY: number;
  /** Zoom level at the moment the anchor was captured */
  zAtCapture: number;
}

/* ── Helpers ── */

/**
 * Maximum vertical offset magnitude at the given zoom.
 *
 * At zoom <= 1 the full content is visible, so no pan is needed (returns 0).
 * At zoom > 1 the pivot can range across the full height, giving offset in
 * [-h/2, h/2].
 */
function clampRange(h: number, z: number): number {
  return z <= 1 ? 0 : h / 2;
}

/** Clamp `v` to [-limit, limit]. */
function clamp(v: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, v));
}

/** Wrap `v` into [0, mod). */
function wrapMod(v: number, mod: number): number {
  return ((v % mod) + mod) % mod;
}

/* ── Hook ── */

/**
 * Unified camera hook for the flat pixel map.
 *
 * Replaces the separate `useZoom` + `useDrag` hooks with a single state owner
 * that supports **mouse-position zoom** (content under the cursor stays fixed
 * while zooming) and smooth rAF lerp animation.
 *
 * - Horizontal (X): content-level offset with infinite wrap via modulo.
 * - Vertical (Y): pivot-shift model (`pivotY = H/2 + offsetY`).
 * - Wheel zoom: proportional (`ZOOM_STEP ** (-deltaY/100)`), clamped to
 *   `[ZOOM_MIN, ZOOM_MAX]`, animated via exponential ease-out lerp.
 * - Drag: inverse-zoom-scaled for consistent feel at any zoom level.
 *
 * @param targetRef - Ref to the DOM element that captures pointer / wheel events
 * @param mapWidth  - Logical pixel width of the map (for X-wrapping)
 * @param mapHeight - Logical pixel height of the map (for Y-clamping)
 */
export function useMapCamera(
  targetRef: RefObject<HTMLDivElement | null>,
  mapWidth: number,
  mapHeight: number,
): MapCameraState {
  /* ── React state (drives re-renders) ── */
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* ── Mutable refs (animation / event state — no re-renders) ── */

  /** Zoom goal we are animating toward */
  const zoomGoalRef = useRef(1);
  /** Current interpolated zoom (updated every rAF frame) */
  const zoomCurrentRef = useRef(1);

  /** Authoritative offsetX (updated by both tick and drag) */
  const offsetXRef = useRef(0);
  /** Authoritative offsetY (updated by both tick and drag) */
  const offsetYRef = useRef(0);

  /** Active rAF id (0 = idle) */
  const rafRef = useRef(0);
  /** Stable tick function ref (set once in useEffect) */
  const tickRef = useRef<() => void>(() => {});

  /** Zoom anchor — null when no anchor-based zoom adjustment is active */
  const anchorRef = useRef<ZoomAnchor | null>(null);

  /** Drag tracking */
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  /** CSS-to-logical scale captured once per drag start */
  const scaleRef = useRef(1);

  /** Keep map dimensions accessible to callbacks without re-creating them */
  const mapWidthRef = useRef(mapWidth);
  const mapHeightRef = useRef(mapHeight);

  useEffect(() => {
    mapWidthRef.current = mapWidth;
    mapHeightRef.current = mapHeight;
  }, [mapWidth, mapHeight]);

  /* ── rAF tick (initialized once, reads only stable refs) ── */

  useEffect(() => {
    const tick = () => {
      const goal = zoomGoalRef.current;
      const current = zoomCurrentRef.current;
      const diff = goal - current;
      const W = mapWidthRef.current;
      const H = mapHeightRef.current;

      // Lerp zoom
      const snapped = Math.abs(diff) < SNAP_EPSILON;
      const zLerped = snapped ? goal : current + diff * LERP_FACTOR;
      zoomCurrentRef.current = zLerped;

      // Compute offsets from anchor (only when not dragging)
      const anchor = anchorRef.current;
      if (anchor && !draggingRef.current) {
        // X — absolute from anchor snapshot
        const rawX =
          anchor.offsetXAtCapture +
          (anchor.screenX - W / 2) * (1 / zLerped - 1 / anchor.zAtCapture);
        offsetXRef.current = wrapMod(rawX, W);

        // Y — pivot-shift inversion
        if (Math.abs(zLerped - 1) < SNAP_EPSILON) {
          // At z=1 the pivot must be centered — avoid division by zero
          offsetYRef.current = 0;
        } else {
          const P =
            (anchor.screenY - anchor.contentY * zLerped) / (1 - zLerped);
          const limit = clampRange(H, zLerped);
          offsetYRef.current = clamp(P - H / 2, limit);
        }
      }
      // If no anchor: offsets stay wherever they are (drag-controlled or idle)

      // Publish to React state
      setZoom(zLerped);
      setOffsetX(offsetXRef.current);
      setOffsetY(offsetYRef.current);

      if (snapped) {
        rafRef.current = 0;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = tick;
  }, []);

  /* ── Wheel handler (zoom + anchor capture) ── */

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const el = e.currentTarget as HTMLElement;
    const canvas = el.querySelector("canvas");
    if (!canvas) return;

    const W = mapWidthRef.current;
    const H = mapHeightRef.current;

    // Proportional zoom factor
    const factor = Math.pow(ZOOM_STEP, -e.deltaY / 100);
    const next = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, zoomGoalRef.current * factor),
    );
    zoomGoalRef.current = next;

    // CSS → logical conversion
    const rect = canvas.getBoundingClientRect();
    const anchorScreenX = (e.clientX - rect.left) * (W / rect.width);
    const anchorScreenY = (e.clientY - rect.top) * (H / rect.height);

    // Content anchor Y — computed from CURRENT refs (not React state)
    const pivotOld = H / 2 + offsetYRef.current;
    const zCurrent = zoomCurrentRef.current;
    const contentAnchorY = (anchorScreenY - pivotOld) / zCurrent + pivotOld;

    anchorRef.current = {
      contentY: contentAnchorY,
      offsetXAtCapture: offsetXRef.current,
      screenX: anchorScreenX,
      screenY: anchorScreenY,
      zAtCapture: zCurrent,
    };

    // Kick rAF if idle
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }, []);

  /* ── Pointer handlers (drag) ── */

  const handlePointerDown = useCallback((e: PointerEvent) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
    setIsDragging(true);

    // Clear zoom anchor — offsets are now user-controlled
    anchorRef.current = null;

    // Measure CSS→logical scale once per drag
    const el = e.currentTarget as HTMLElement;
    const canvas = el.querySelector("canvas");
    scaleRef.current = canvas
      ? mapWidthRef.current / canvas.getBoundingClientRect().width
      : 1;

    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return;

    const dxCss = e.clientX - lastXRef.current;
    const dyCss = e.clientY - lastYRef.current;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;

    const scale = scaleRef.current;
    const z = zoomCurrentRef.current;
    const W = mapWidthRef.current;
    const H = mapHeightRef.current;

    // X — infinite wrap
    const nextX = offsetXRef.current + (dxCss * scale) / z;
    offsetXRef.current = wrapMod(nextX, W);
    setOffsetX(offsetXRef.current);

    // Y — clamped, inverted sign for grab-and-move feel
    const limit = clampRange(H, z);
    const nextY = offsetYRef.current - (dyCss * scale) / z;
    offsetYRef.current = clamp(nextY, limit);
    setOffsetY(offsetYRef.current);
  }, []);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
  }, []);

  /* ── Event binding ── */

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // Wheel — passive: false required for preventDefault()
    el.addEventListener("wheel", handleWheel, { passive: false });

    // Pointer
    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerUp);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerUp);
      el.removeEventListener("pointercancel", handlePointerUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [
    targetRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  ]);

  /* ── Derived clamp (zoom shrink guard — same as useDrag) ── */

  const maxY = clampRange(mapHeight, zoom);
  const clampedOffsetY = clamp(offsetY, maxY);

  return { isDragging, offsetX, offsetY: clampedOffsetY, zoom };
}
