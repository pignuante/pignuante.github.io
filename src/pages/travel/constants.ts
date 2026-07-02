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

/** Alpha for visited-country tint overlay (0–1) */
export const VISITED_OVERLAY_ALPHA = 0.18;

/** Background dot grid color */
export const COLOR_WORLD_BG_DOT = 0x1c_19_17;

/* ── Country hover highlight constants ── */

/** Hovered visited-country tint overlay alpha (stronger than normal visited) */
export const HOVER_OVERLAY_ALPHA = 0.35;

/** Hovered country border outline color (warm red at full saturation) */
export const COLOR_HOVER_BORDER = 0xff_44_44;

/** Hovered country border outline alpha */
export const HOVER_BORDER_ALPHA = 0.6;

/**
 * Fuzzy hover search radius in cells.
 * When direct cell hit misses, search within this radius for the nearest
 * visited country. Helps small countries (e.g. Switzerland, Taiwan) be
 * easier to hover over. 2 cells = 6px expansion around cursor.
 */
export const HOVER_SEARCH_RADIUS = 2;

/* ── Globe constants ── */

/** Globe canvas size in logical pixels (square — orthographic projects a circle) */
export const GLOBE_SIZE = 720;

/** Globe pixel cell size (same as world map for visual consistency) */
export const GLOBE_CELL_SIZE = 3;

/** Globe initial rotation — centered on South Korea (127°E, 37°N) */
export const GLOBE_INITIAL_LAMBDA = 127;
export const GLOBE_INITIAL_PHI = 37;

/**
 * Sensitivity: degrees of rotation per CSS pixel of drag.
 * ~0.3 feels natural for a 720px globe (full drag across = ~216° rotation).
 */
export const GLOBE_DRAG_SENSITIVITY = 0.3;

/** Globe outline circle color */
export const COLOR_GLOBE_OUTLINE = 0xd6_d3_d1;

/** Globe ocean background color (base fill for gaps between ocean cells) */
export const COLOR_GLOBE_OCEAN = 0xf0_f4_f8;

/* ── Ocean biome colors (latitude-based, PixiJS hex) ── */

/** Tropical waters (0°–20°) — warm turquoise */
export const COLOR_OCEAN_TROPICAL = 0xc8_e8_e4;

/** Subtropical waters (20°–40°) — clear blue */
export const COLOR_OCEAN_SUBTROPICAL = 0xd0_e4_f0;

/** Temperate waters (40°–60°) — cool grey-blue */
export const COLOR_OCEAN_TEMPERATE = 0xd4_dc_e8;

/** Polar waters (60°–90°) — icy pale blue */
export const COLOR_OCEAN_POLAR = 0xe0_e8_f0;

/** BFS distance (in cells) at which ocean reaches maximum darkening */
export const MAX_OCEAN_DEPTH_CELLS = 25;

/** Wave pattern period — every Nth cell gets a highlight dot */
export const OCEAN_WAVE_PERIOD = 5;

/** Maximum darkening factor for deep ocean (0–1, applied multiplicatively) */
export const OCEAN_DEPTH_DARKEN_MAX = 0.3;

/** Lightening amount for wave highlight dots (added to each RGB channel) */
export const OCEAN_WAVE_LIGHTEN = 8;

/* ── Zoom constants ── */

/** Minimum zoom level (no zoom-out beyond default) */
export const ZOOM_MIN = 1;

/** Maximum zoom level */
export const ZOOM_MAX = 4;

/** Zoom multiplier per wheel tick (~5% per step, ~28 ticks to reach 4×) */
export const ZOOM_STEP = 1.05;

/* ── Biome CSS hex (for HTML legend) ── */

const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

export const BIOME_COLORS_CSS: Record<Biome, string> = {
  arid: toHex(BIOME_COLORS.arid),
  continental: toHex(BIOME_COLORS.continental),
  polar: toHex(BIOME_COLORS.polar),
  temperate: toHex(BIOME_COLORS.temperate),
  tropical: toHex(BIOME_COLORS.tropical),
};
