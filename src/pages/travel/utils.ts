import {
  COLOR_OCEAN_POLAR,
  COLOR_OCEAN_SUBTROPICAL,
  COLOR_OCEAN_TEMPERATE,
  COLOR_OCEAN_TROPICAL,
} from "./constants";

/**
 * Wrap a pixel coordinate into [0, width) range.
 * Used for infinite horizontal panning in world map.
 */
export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

/** Convert PixiJS numeric hex to CSS color string (e.g. 0xff0000 → "#ff0000") */
export function pixiHexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/**
 * Darken a PixiJS hex color by a factor (0 = unchanged, 1 = black).
 * Each RGB channel is multiplied by `(1 - factor)`.
 */
export function darkenColor(hex: number, factor: number): number {
  const scale = 1 - factor;
  const r = Math.round(((hex >> 16) & 0xff) * scale);
  const g = Math.round(((hex >> 8) & 0xff) * scale);
  const b = Math.round((hex & 0xff) * scale);
  return (r << 16) | (g << 8) | b;
}

/**
 * Lighten a PixiJS hex color by adding `amount` to each channel (capped at 255).
 * Used for sparse wave-highlight dots on ocean cells.
 */
export function lightenColor(hex: number, amount: number): number {
  const r = Math.min(((hex >> 16) & 0xff) + amount, 255);
  const g = Math.min(((hex >> 8) & 0xff) + amount, 255);
  const b = Math.min((hex & 0xff) + amount, 255);
  return (r << 16) | (g << 8) | b;
}

/** Resolve latitude band to ocean base color (PixiJS hex) */
export function oceanColorFromLatitude(absLat: number): number {
  if (absLat < 20) return COLOR_OCEAN_TROPICAL;
  if (absLat < 40) return COLOR_OCEAN_SUBTROPICAL;
  if (absLat < 60) return COLOR_OCEAN_TEMPERATE;
  return COLOR_OCEAN_POLAR;
}

/**
 * Device pixels one map cell spans at zoom 1, or null when that is not a
 * whole number (the canvas width could not be snapped). `cellSize` is the
 * cell pitch in logical px, `resolution` the renderer resolution.
 */
export function cellDevicePixels(
  cellSize: number,
  resolution: number | undefined,
): null | number {
  if (resolution === undefined) return null;
  const pixels = cellSize * resolution;
  return Math.abs(pixels - Math.round(pixels)) < 1e-6
    ? Math.round(pixels)
    : null;
}

/**
 * Round a zoom level to the nearest m / cellPixels, so a zoomed cell still
 * spans a whole number of device pixels and the 1px gaps stay even. Without
 * a whole-pixel cell (cellPixels null) the zoom is returned unchanged.
 */
export function quantizeZoom(
  zoom: number,
  cellPixels: null | number,
  min: number,
  max: number,
): number {
  const clamped = Math.max(min, Math.min(max, zoom));
  if (cellPixels === null) return clamped;
  const step = Math.round(clamped * cellPixels);
  return (
    Math.max(
      Math.ceil(min * cellPixels),
      Math.min(Math.floor(max * cellPixels), step),
    ) / cellPixels
  );
}
