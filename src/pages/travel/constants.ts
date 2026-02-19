import type { Biome } from "./types";

/** Canvas logical dimensions (DPR scaling handled by PixiJS resolution prop) */
export const WORLD_MAP_WIDTH = 960;
export const WORLD_MAP_HEIGHT = 504;

/** Breathing room (px) between canvas edge and projected map outline */
export const WORLD_MAP_INSET = 4;

/** Pixel cell size in screen pixels (3px balances detail vs pixel-art feel) */
export const WORLD_CELL_SIZE = 3;

/* ── Biome color palette (PixiJS hex) ── */

export const BIOME_COLORS: Record<Biome, number> = {
  arid: 0xd2_b4_8c, // tan / sand
  continental: 0x6b_8e_23, // olive drab
  polar: 0xb0_c4_de, // light steel blue
  temperate: 0x3c_b3_71, // medium sea green
  tropical: 0x22_8b_22, // forest green
};

/** Country boundary line color */
export const COLOR_WORLD_BORDER = 0x8b_85_7a;

/** Visited country highlight tint — warm overlay */
export const COLOR_VISITED_TINT = 0xff_6b_6b;

/** Background dot grid color */
export const COLOR_WORLD_BG_DOT = 0x1c_19_17;

/* ── Country marker constants ── */

/** Marker outer dot radius */
export const MARKER_DOT_RADIUS = 3;

/** Marker inner dot radius */
export const MARKER_DOT_INNER_RADIUS = 1.5;

/** Marker outer color (warm red, same as visited tint) */
export const COLOR_MARKER_OUTER = 0xff_6b_6b;

/** Marker inner color (white) */
export const COLOR_MARKER_INNER = 0xff_ff_ff;

/** Hit-test radius multiplier (for hover detection) */
export const MARKER_HIT_RADIUS_MULTIPLIER = 3;

/* ── Biome CSS hex (for HTML legend) ── */

const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

export const BIOME_COLORS_CSS: Record<Biome, string> = {
  arid: toHex(BIOME_COLORS.arid),
  continental: toHex(BIOME_COLORS.continental),
  polar: toHex(BIOME_COLORS.polar),
  temperate: toHex(BIOME_COLORS.temperate),
  tropical: toHex(BIOME_COLORS.tropical),
};
