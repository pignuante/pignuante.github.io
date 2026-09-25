import { type RefObject, useEffect, useState } from "react";

/**
 * Snapping below this share of the available width costs more than the
 * moiré it removes (e.g. a 1x display where one step is 240px), so the map
 * keeps the full width there.
 */
const MIN_SNAP_RATIO = 0.8;

interface SnapOptions {
  /** Cells across the canvas (logical width / cell pitch). */
  cells: number;
  /** Horizontal space around the canvas inside the container (e.g. borders). */
  inset: number;
  /** Upper bound in CSS px for the canvas, recomputed on resize. */
  maxWidth: () => number;
}

/**
 * The maps draw 1px gaps between cells on a fixed logical canvas that CSS
 * then scales. At a non-integer device-pixel pitch those gaps land on
 * fractional pixels and come out as uneven 1px/2px stripes. This returns a
 * canvas width (CSS px) at which one cell spans a whole number of device
 * pixels, so the nearest-neighbour pattern repeats identically per cell.
 *
 * Returns null until the container has been measured.
 */
export function usePixelSnappedWidth(
  containerRef: RefObject<HTMLElement | null>,
  { cells, inset, maxWidth }: SnapOptions,
): null | number {
  const [width, setWidth] = useState<null | number>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = (): void => {
      const available = Math.min(container.clientWidth - inset, maxWidth());
      const step = cells / window.devicePixelRatio;
      const snapped = Math.floor(available / step) * step;
      setWidth(snapped >= available * MIN_SNAP_RATIO ? snapped : available);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    // Viewport height (maxWidth) and browser zoom (devicePixelRatio) do not
    // resize the container, but both fire a window resize.
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cells, containerRef, inset, maxWidth]);

  return width;
}
