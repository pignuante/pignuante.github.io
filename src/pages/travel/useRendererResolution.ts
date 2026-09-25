import type { Application } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";

/**
 * Keeps a Pixi renderer's backing store at `resolution` after init.
 * @pixi/react only reads `resolution` when the Application is created, so a
 * later change has to go through renderer.resize().
 *
 * Returns the `onInit` handler to pass to <Application>.
 */
export function useRendererResolution(
  width: number,
  height: number,
  resolution: number,
): (app: Application) => void {
  const appRef = useRef<Application | null>(null);
  const latest = useRef({ height, resolution, width });

  useEffect(() => {
    latest.current = { height, resolution, width };
    appRef.current?.renderer.resize(width, height, resolution);
  }, [height, resolution, width]);

  return useCallback((app: Application): void => {
    appRef.current = app;
    const { height: h, resolution: r, width: w } = latest.current;
    app.renderer.resize(w, h, r);
  }, []);
}
