/** Pin bitmap, anchored at its bottom tip. O outline, F fill, H highlight. */
export const PIN_ROWS = [
  "..OOO..",
  ".OFFFO.",
  "OFFHFFO",
  "OFFFFFO",
  ".OFFFO.",
  "..OFO..",
  "...O...",
];
/** Target on-screen pin width, CSS px, regardless of how far the canvas is scaled */
const PIN_TARGET_CSS_PX = 16;

/**
 * Whole logical px per pin pixel so the pin shows at about PIN_TARGET_CSS_PX
 * when the canvas is displayed at `cssPerLogical` CSS px per logical px.
 */
export function pinPixelSize(cssPerLogical: number): number {
  const pinCells = PIN_ROWS[0].length;
  return Math.max(2, Math.round(PIN_TARGET_CSS_PX / pinCells / cssPerLogical));
}
