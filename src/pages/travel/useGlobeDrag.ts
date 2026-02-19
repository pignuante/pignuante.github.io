import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GlobeRotation } from "./types";
import { GLOBE_DRAG_SENSITIVITY, GLOBE_SIZE } from "./constants";

/** Return type for the globe drag hook */
interface GlobeDragState {
  isDragging: boolean;
  rotation: GlobeRotation;
}

/**
 * Rotation-based drag hook for a pixel-art globe.
 *
 * Converts pointer drag deltas into spherical rotation (lambda/phi).
 * Horizontal drag rotates longitude freely (wraps); vertical drag
 * rotates latitude clamped to [-90, 90].
 *
 * Uses pointer capture so the drag continues outside the element.
 *
 * @param targetRef - Ref to the DOM element that captures drag
 * @param initialRotation - Starting globe rotation (lambda/phi degrees)
 */
export function useGlobeDrag(
  targetRef: RefObject<HTMLDivElement | null>,
  initialRotation: GlobeRotation,
): GlobeDragState {
  const [rotation, setRotation] = useState<GlobeRotation>(initialRotation);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking drag without re-renders
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const scaleRef = useRef(1);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
    setIsDragging(true);

    // Measure CSS→logical scale once per drag
    const el = e.currentTarget as HTMLElement;
    const canvas = el.querySelector("canvas");
    scaleRef.current = canvas
      ? GLOBE_SIZE / canvas.getBoundingClientRect().width
      : 1;

    // Capture pointer so drag continues outside the element
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return;

    const dxCss = e.clientX - lastXRef.current;
    const dyCss = e.clientY - lastYRef.current;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;

    // Use scale cached in handlePointerDown (no layout thrash)
    const scale = scaleRef.current;

    setRotation((prev) => {
      const rawLambda = prev.lambda + dxCss * scale * GLOBE_DRAG_SENSITIVITY;
      const lambda = ((rawLambda % 360) + 360) % 360;
      const phi = Math.max(
        -90,
        Math.min(90, prev.phi - dyCss * scale * GLOBE_DRAG_SENSITIVITY),
      );
      return { lambda, phi };
    });
  }, []);

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

  return { isDragging, rotation };
}
