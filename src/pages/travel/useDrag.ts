import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Drag state for map panning (horizontal infinite scroll + vertical clamped pan) */
interface DragState {
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Cumulative horizontal pixel offset (wraps via modulo in consumers) */
  offsetX: number;
  /** Vertical pixel offset from center (clamped based on zoom) */
  offsetY: number;
}

/** Max vertical offset at the given zoom (0 at zoom=1, grows as zoom increases) */
function clampRange(h: number, z: number): number {
  return Math.max(0, (h / 2) * (1 - 1 / z));
}

/**
 * Hook for drag panning on a DOM element.
 *
 * - Horizontal (X): infinite wrapping via modulo
 * - Vertical (Y): clamped so content edges stay within viewport
 * - Drag speed scales inversely with zoom (consistent feel at any zoom level)
 *
 * @param targetRef - Ref to the DOM element that captures drag
 * @param mapWidth  - Logical pixel width for wrapping normalization
 * @param mapHeight - Logical pixel height for vertical clamp calculation
 * @param zoom      - Current zoom level (1 = default, higher = zoomed in)
 */
export function useDrag(
  targetRef: RefObject<HTMLDivElement | null>,
  mapWidth: number,
  mapHeight: number,
  zoom: number,
): DragState {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking drag without re-renders
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const scaleRef = useRef(1);

  // Keep mutable values in refs so callbacks stay stable
  const zoomRef = useRef(zoom);
  const mapHeightRef = useRef(mapHeight);

  useEffect(() => {
    zoomRef.current = zoom;
    mapHeightRef.current = mapHeight;
  }, [zoom, mapHeight]);

  // Derive clamped offsetY (range shrinks when zoom decreases)
  const max = clampRange(mapHeight, zoom);
  const clampedOffsetY = Math.max(-max, Math.min(max, offsetY));

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      draggingRef.current = true;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      setIsDragging(true);

      // Measure CSS→logical scale once per drag
      const el = e.currentTarget as HTMLElement;
      const canvas = el.querySelector("canvas");
      scaleRef.current = canvas
        ? mapWidth / canvas.getBoundingClientRect().width
        : 1;

      // Capture pointer so drag continues outside the element
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [mapWidth],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current) return;

      const dxCss = e.clientX - lastXRef.current;
      const dyCss = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;

      const scale = scaleRef.current;
      const z = zoomRef.current;
      const h = mapHeightRef.current;

      // Divide by zoom so drag distance feels consistent at any zoom level
      setOffsetX((prev) => {
        const next = prev + (dxCss * scale) / z;
        return ((next % mapWidth) + mapWidth) % mapWidth;
      });

      // Vertical: inverted sign for grab-and-move feel, clamped to content bounds
      setOffsetY((prev) => {
        const next = prev - (dyCss * scale) / z;
        const max = clampRange(h, z);
        return Math.max(-max, Math.min(max, next));
      });
    },
    [mapWidth],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerUp);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerUp);
      el.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [targetRef, handlePointerDown, handlePointerMove, handlePointerUp]);

  return { isDragging, offsetX, offsetY: clampedOffsetY };
}
