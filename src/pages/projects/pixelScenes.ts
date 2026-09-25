/**
 * Pixel-art thumbnail scenes, drawn on a 64x36 grid (16:9).
 *
 * Colours are CSS variables, so every scene follows the active colour scheme.
 * Wider slots (16:7, 16:8) crop top and bottom (`slice`), so the subject of
 * each scene stays within rows 5-31.
 */

export const PIXEL_SCENE_WIDTH = 64;
export const PIXEL_SCENE_HEIGHT = 36;

/** Palette keys -> CSS colour */
export const PIXEL_PALETTE = {
  a1: "var(--color-accent-100)",
  a2: "var(--color-accent-200)",
  a3: "var(--color-accent-300)",
  a4: "var(--color-accent-400)",
  a6: "var(--color-accent-600)",
  b1: "var(--color-brand-100)",
  b2: "var(--color-brand-200)",
  b3: "var(--color-brand-300)",
  b5: "var(--color-brand-500)",
  b7: "var(--color-brand-700)",
  D: "var(--color-neutral-600)",
  G: "var(--color-neutral-300)",
  K: "var(--color-neutral-800)",
  L: "var(--color-neutral-200)",
  N: "var(--color-neutral-100)",
  R: "var(--color-error)",
  W: "var(--surface-elevated)",
  Y: "var(--color-warning)",
} as const;

export type PixelColor = keyof typeof PIXEL_PALETTE;

/** [x, y, width, height, colour] in grid cells */
export type PixelRect = readonly [number, number, number, number, PixelColor];

/**
 * How a layer moves. "flicker-a" and "flicker-b" are the two frames of a
 * flame (a is shown at rest); "twinkle" dims and brightens.
 */
export type PixelLayerMotion = "flicker-a" | "flicker-b" | "twinkle";

export interface PixelLayer {
  /** Animation delay in seconds, to de-sync twinkles */
  delay?: number;
  motion?: PixelLayerMotion;
  rects: readonly PixelRect[];
}

export type PixelSceneId = "campfire" | "kingdom" | "raid-board" | "route-map";

/* ── Helpers ── */

/** Plus-shaped sparkle centred on (x, y) */
function sparkle(x: number, y: number, color: PixelColor): PixelRect[] {
  return [
    [x - 1, y, 3, 1, color],
    [x, y - 1, 1, 3, color],
  ];
}

/** Small pine: 1-3-3 crown over a trunk, top at (x, y) */
function pine(x: number, y: number): PixelRect[] {
  return [
    [x + 1, y, 1, 1, "a6"],
    [x, y + 1, 3, 2, "a6"],
    [x + 1, y + 3, 1, 1, "D"],
  ];
}

/** Dots every `step` cells along a polyline */
function dottedPath(
  points: readonly (readonly [number, number])[],
  step: number,
  color: PixelColor,
): PixelRect[] {
  const dots: PixelRect[] = [];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const length = Math.hypot(x1 - x0, y1 - y0);
    for (let d = carry; d < length; d += step) {
      const t = d / length;
      dots.push([
        Math.round(x0 + (x1 - x0) * t),
        Math.round(y0 + (y1 - y0) * t),
        1,
        1,
        color,
      ]);
      carry = d + step - length;
    }
  }
  return dots;
}

/** Staggered brick joints for a wall between rows y0 and y1 */
function brickJoints(y0: number, y1: number): PixelRect[] {
  const rects: PixelRect[] = [];
  for (let y = y0, row = 0; y < y1; y += 5, row++) {
    rects.push([0, y, PIXEL_SCENE_WIDTH, 1, "L"]);
    for (let x = row % 2 === 0 ? 3 : 7; x < PIXEL_SCENE_WIDTH; x += 8) {
      rects.push([x, y + 1, 1, 4, "L"]);
    }
  }
  return rects;
}

/* ── Scenes ── */

/** Pixel Kingdom Portal: a castle with a glowing portal gate */
const KINGDOM: readonly PixelLayer[] = [
  {
    rects: [
      [0, 0, 64, 27, "b1"],
      [0, 20, 14, 7, "a2"],
      [46, 18, 18, 9, "a2"],
      [0, 23, 64, 4, "a2"],
      [0, 27, 64, 9, "a3"],
      [0, 27, 64, 1, "a4"],
      [6, 31, 2, 1, "a4"],
      [13, 33, 2, 1, "a4"],
      [50, 30, 2, 1, "a4"],
      [57, 33, 2, 1, "a4"],
      // Road from the gate, widening toward the viewer
      ...Array.from({ length: 8 }, (_, i): PixelRect => [
        30 - i,
        28 + i,
        5 + 2 * i,
        1,
        "L",
      ]),
    ],
  },
  { delay: 0, motion: "twinkle", rects: [...sparkle(7, 8, "b3")] },
  { delay: 0.7, motion: "twinkle", rects: [...sparkle(56, 9, "b3")] },
  { delay: 1.4, motion: "twinkle", rects: [...sparkle(11, 15, "b2")] },
  {
    rects: [
      // Flags
      [19, 4, 1, 4, "K"],
      [20, 4, 3, 2, "Y"],
      [44, 4, 1, 4, "K"],
      [45, 4, 3, 2, "Y"],
      // Towers
      [16, 8, 2, 2, "K"],
      [19, 8, 2, 2, "K"],
      [22, 8, 2, 2, "K"],
      [16, 10, 8, 18, "K"],
      [17, 11, 6, 16, "b3"],
      [41, 8, 2, 2, "K"],
      [44, 8, 2, 2, "K"],
      [47, 8, 2, 2, "K"],
      [41, 10, 8, 18, "K"],
      [42, 11, 6, 16, "b3"],
      // Wall and battlements
      [24, 12, 2, 2, "K"],
      [28, 12, 2, 2, "K"],
      [32, 12, 1, 2, "K"],
      [35, 12, 2, 2, "K"],
      [39, 12, 2, 2, "K"],
      [23, 14, 19, 14, "K"],
      [24, 15, 17, 12, "b2"],
      // Windows
      [19, 13, 2, 3, "b7"],
      [44, 13, 2, 3, "b7"],
      [19, 20, 2, 3, "b7"],
      [44, 20, 2, 3, "b7"],
      // Stones
      [25, 17, 2, 1, "b3"],
      [38, 17, 2, 1, "b3"],
      [26, 24, 2, 1, "b3"],
      [37, 24, 2, 1, "b3"],
      // Portal gate
      [29, 17, 7, 1, "K"],
      [28, 18, 9, 10, "K"],
      [30, 18, 5, 1, "a4"],
      [29, 19, 7, 9, "a4"],
      [31, 20, 3, 7, "a2"],
    ],
  },
  { delay: 0.3, motion: "twinkle", rects: [[32, 21, 1, 1, "W"]] },
  { delay: 1.1, motion: "twinkle", rects: [[31, 24, 1, 1, "W"]] },
];

/** Dungeon Party Planner: a raid schedule board between two torches */
const RAID_BOARD: readonly PixelLayer[] = [
  {
    rects: [
      [0, 0, 64, 30, "N"],
      ...brickJoints(4, 30),
      [0, 30, 64, 6, "G"],
      [0, 30, 64, 1, "D"],
      // Board
      [14, 5, 36, 24, "K"],
      [15, 6, 34, 22, "b7"],
      [17, 7, 30, 2, "b5"],
      [19, 8, 8, 1, "W"],
      [43, 7, 2, 2, "Y"],
      [17, 10, 30, 16, "W"],
      // Schedule grid: 5 days x 3 slots
      ...[11, 16, 21].flatMap((y) =>
        [18, 24, 30, 36, 42].map((x): PixelRect => [x, y, 5, 4, "N"]),
      ),
      // Booked, conflicting and starred slots
      [18, 11, 5, 4, "a3"],
      [30, 11, 5, 4, "a3"],
      [24, 16, 5, 4, "a3"],
      [42, 16, 5, 4, "a3"],
      [36, 21, 5, 4, "a3"],
      [36, 11, 5, 4, "R"],
      [37, 12, 1, 1, "W"],
      [39, 12, 1, 1, "W"],
      [38, 13, 1, 1, "W"],
      [30, 21, 5, 4, "b3"],
      [32, 22, 1, 2, "Y"],
      [31, 23, 3, 1, "Y"],
      // Torch handles
      [6, 13, 3, 1, "D"],
      [7, 14, 1, 8, "D"],
      [55, 13, 3, 1, "D"],
      [56, 14, 1, 8, "D"],
    ],
  },
  {
    motion: "flicker-a",
    rects: [
      [6, 10, 3, 3, "R"],
      [7, 11, 1, 2, "Y"],
      [55, 10, 3, 3, "R"],
      [56, 11, 1, 2, "Y"],
    ],
  },
  {
    motion: "flicker-b",
    rects: [
      [7, 8, 1, 2, "R"],
      [6, 10, 3, 3, "R"],
      [7, 10, 1, 3, "Y"],
      [56, 8, 1, 2, "R"],
      [55, 10, 3, 3, "R"],
      [56, 10, 1, 3, "Y"],
    ],
  },
];

/** Route Quest Board: a map with a dotted route through checkpoints */
const ROUTE_MAP: readonly PixelLayer[] = [
  {
    rects: [
      [0, 0, 64, 36, "a1"],
      [3, 3, 11, 5, "a2"],
      [46, 3, 13, 4, "a2"],
      [38, 25, 16, 6, "a2"],
      // River
      [26, 0, 3, 6, "b2"],
      [24, 6, 3, 5, "b2"],
      [22, 11, 3, 6, "b2"],
      [23, 17, 3, 6, "b2"],
      [25, 23, 3, 6, "b2"],
      [27, 29, 3, 7, "b2"],
      // Bridge
      [21, 20, 6, 2, "L"],
      ...pine(6, 9),
      ...pine(11, 12),
      ...pine(36, 5),
      ...pine(50, 14),
      ...pine(54, 18),
      ...pine(58, 26),
      ...pine(9, 26),
      // Route
      ...dottedPath(
        [
          [9, 30],
          [16, 28],
          [21, 23],
          [24, 21],
          [32, 20],
          [40, 17],
          [46, 11],
          [51, 9],
        ],
        2,
        "b5",
      ),
      // Start
      [8, 29, 3, 3, "b5"],
      [9, 30, 1, 1, "W"],
      // Checkpoints
      [32, 15, 1, 5, "K"],
      [33, 15, 3, 2, "b5"],
      [40, 12, 1, 5, "K"],
      [41, 12, 3, 2, "b5"],
      // Goal
      [52, 3, 1, 7, "K"],
      [53, 3, 4, 3, "Y"],
    ],
  },
  { delay: 0, motion: "twinkle", rects: [...sparkle(59, 8, "Y")] },
  { delay: 0.8, motion: "twinkle", rects: [...sparkle(48, 4, "Y")] },
];

/** Campfire Log: a fire at dusk with an open journal */
const CAMPFIRE: readonly PixelLayer[] = [
  {
    rects: [
      [0, 0, 64, 26, "b1"],
      [0, 0, 64, 7, "b2"],
      // Moon
      [51, 3, 4, 5, "W"],
      [50, 4, 1, 3, "W"],
      [53, 3, 2, 3, "b2"],
      // Tree line
      [0, 22, 6, 4, "a6"],
      [5, 20, 4, 6, "a6"],
      [10, 23, 6, 3, "a6"],
      [44, 21, 5, 5, "a6"],
      [50, 23, 7, 3, "a6"],
      [57, 20, 4, 6, "a6"],
      [60, 22, 4, 4, "a6"],
      // Ground
      [0, 26, 64, 10, "a3"],
      [0, 26, 64, 1, "a4"],
      // Journal
      [43, 27, 13, 7, "K"],
      [44, 28, 5, 5, "W"],
      [50, 28, 5, 5, "W"],
      [49, 27, 1, 7, "b7"],
      [45, 29, 3, 1, "G"],
      [45, 31, 3, 1, "G"],
      [51, 29, 3, 1, "G"],
      [51, 31, 2, 1, "G"],
      // Log seat
      [10, 31, 10, 2, "D"],
      [10, 31, 1, 2, "L"],
      [19, 31, 1, 2, "L"],
      // Stones and logs
      [25, 31, 3, 2, "G"],
      [36, 31, 3, 2, "G"],
      [27, 29, 10, 2, "D"],
      [27, 29, 1, 2, "L"],
      [36, 29, 1, 2, "L"],
    ],
  },
  { delay: 0, motion: "twinkle", rects: [[6, 3, 1, 1, "W"]] },
  { delay: 0.6, motion: "twinkle", rects: [[17, 5, 1, 1, "W"]] },
  { delay: 1.2, motion: "twinkle", rects: [[29, 2, 1, 1, "W"]] },
  { delay: 0.9, motion: "twinkle", rects: [[41, 6, 1, 1, "W"]] },
  {
    motion: "flicker-a",
    rects: [
      [31, 19, 2, 2, "R"],
      [30, 21, 4, 2, "R"],
      [29, 23, 6, 6, "R"],
      [31, 22, 2, 2, "Y"],
      [30, 24, 4, 5, "Y"],
      [31, 26, 2, 3, "W"],
      [27, 17, 1, 1, "Y"],
    ],
  },
  {
    motion: "flicker-b",
    rects: [
      [32, 18, 1, 2, "R"],
      [30, 20, 3, 2, "R"],
      [29, 22, 6, 7, "R"],
      [32, 21, 1, 2, "Y"],
      [30, 23, 4, 6, "Y"],
      [31, 25, 2, 4, "W"],
      [37, 16, 1, 1, "Y"],
    ],
  },
];

export const PIXEL_SCENES: Readonly<
  Record<PixelSceneId, readonly PixelLayer[]>
> = {
  campfire: CAMPFIRE,
  kingdom: KINGDOM,
  "raid-board": RAID_BOARD,
  "route-map": ROUTE_MAP,
};
