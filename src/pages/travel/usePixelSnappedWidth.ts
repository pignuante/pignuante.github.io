import { type RefObject, useLayoutEffect, useState } from "react";

/**
 * Snapping below this share of the available width costs more than the
 * moiré it removes, so the map keeps the full width there. 0.75 still lets
 * a 1x desktop snap the flat map from ~1224px to 960px (78%), its size
 * before this hook existed.
 */
const MIN_SNAP_RATIO = 0.75;

interface SnapOptions {
  /** Cells across the canvas (logical width / cell pitch). */
  cells: number;
  /** Horizontal space around the canvas inside the container (e.g. borders). */
  inset: number;
  /** Logical canvas width the renderer draws at. */
  logicalWidth: number;
  /** Optional upper bound in CSS px for the canvas, re-read on every update. */
  maxWidth?: () => number;
}

export interface SnappedCanvas {
  /** Renderer resolution matching the displayed device pixels. */
  resolution: number;
  /** Canvas width in CSS px. */
  width: number;
}

/**
 * The maps draw 1px gaps between cells on a fixed logical canvas. When one
 * cell does not span a whole number of device pixels the gaps come out as
 * uneven 1px/2px stripes (moiré). This picks the widest canvas width at which
 * a cell spans a whole number of device pixels (k * cells / dpr), plus the
 * renderer resolution that makes the backing store exactly that many device
 * pixels. On a snapped width the browser then does not resample the canvas;
 * scaling happens once, in WebGL with nearest sampling. (A fallback width is
 * not a whole number of device pixels per cell, so it is not exact.) Compositor resampling looked uneven in a
 * desktop browser even at an integer pitch (headless Chrome did not show it).
 *
 * Measured in a layout effect so the first paint already has the final size.
 */
export function usePixelSnappedWidth(
  containerRef: RefObject<HTMLElement | null>,
  { cells, inset, logicalWidth, maxWidth }: SnapOptions,
): null | SnappedCanvas {
  const [canvas, setCanvas] = useState<null | SnappedCanvas>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = (): void => {
      const dpr = window.devicePixelRatio;
      const available = Math.max(
        0,
        Math.min(container.clientWidth - inset, maxWidth?.() ?? Infinity),
      );
      const step = cells / dpr;
      const snapped = Math.floor(available / step) * step;
      const width = snapped >= available * MIN_SNAP_RATIO ? snapped : available;
      const resolution = width > 0 ? (width * dpr) / logicalWidth : dpr;
      setCanvas((previous) =>
        previous?.width === width && previous.resolution === resolution
          ? previous
          : { resolution, width },
      );
    };

    // Moving the window to a monitor with another DPR fires no resize; a
    // resolution query that re-arms itself on each change does.
    let resolutionQuery: MediaQueryList | null = null;
    const watchResolution = (): void => {
      resolutionQuery?.removeEventListener("change", onResolutionChange);
      resolutionQuery = window.matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`,
      );
      resolutionQuery.addEventListener("change", onResolutionChange);
    };
    function onResolutionChange(): void {
      update();
      watchResolution();
    }

    update();
    watchResolution();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    // Viewport height (maxWidth) does not resize the container.
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      resolutionQuery?.removeEventListener("change", onResolutionChange);
    };
  }, [cells, containerRef, inset, logicalWidth, maxWidth]);

  return canvas;
}
