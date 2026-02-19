import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Drag state for horizontal infinite scroll */
interface DragState {
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Cumulative horizontal pixel offset (wraps via modulo in consumers) */
  offsetX: number;
}

/**
 * Hook for horizontal drag on a DOM element.
 *
 * Uses pointer events (mouse + touch unified) on the given ref.
 * Returns cumulative offsetX — consumers apply modulo wrapping.
 *
 * @param targetRef - Ref to the DOM element that captures drag
 * @param mapWidth - Logical pixel width for wrapping normalization
 */
export function useDrag(
  targetRef: RefObject<HTMLDivElement | null>,
  mapWidth: number,
): DragState {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking drag without re-renders
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const scaleRef = useRef(1);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      draggingRef.current = true;
      lastXRef.current = e.clientX;
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
      lastXRef.current = e.clientX;

      // Use scale cached in handlePointerDown (no layout thrash)
      const scale = scaleRef.current;

      setOffsetX((prev) => {
        const next = prev + dxCss * scale;
        return ((next % mapWidth) + mapWidth) % mapWidth;
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

  return { isDragging, offsetX };
}
