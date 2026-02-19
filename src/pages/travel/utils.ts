/**
 * Wrap a pixel coordinate into [0, width) range.
 * Used for infinite horizontal panning in world map.
 */
export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}
