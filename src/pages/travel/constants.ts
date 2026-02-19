import type { Biome } from "./types";

/** Canvas logical dimensions (DPR scaling handled by PixiJS resolution prop) */
export const WORLD_MAP_WIDTH = 648;
export const WORLD_MAP_HEIGHT = 368;

/** Breathing room (px) between canvas edge and projected map outline */
export const WORLD_MAP_INSET = 4;

/**
 * @deprecated Kept at 0 — projection margins are handled by WORLD_MAP_INSET
 * via fitExtent in useWorldPixelGrid. Graphics draw at absolute positions.
 */
export const WORLD_MAP_PADDING = 0;

/** Pixel cell size in screen pixels */
export const WORLD_CELL_SIZE = 4;

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

/* ── Biome CSS hex (for HTML legend) ── */

const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

export const BIOME_COLORS_CSS: Record<Biome, string> = {
  arid: toHex(BIOME_COLORS.arid),
  continental: toHex(BIOME_COLORS.continental),
  polar: toHex(BIOME_COLORS.polar),
  temperate: toHex(BIOME_COLORS.temperate),
  tropical: toHex(BIOME_COLORS.tropical),
};

export const COLOR_VISITED_TINT_CSS = toHex(COLOR_VISITED_TINT);

/* ── Biome Korean labels ── */

export const BIOME_LABELS_KO: Record<Biome, string> = {
  arid: "건조",
  continental: "대륙성",
  polar: "극지",
  temperate: "온대",
  tropical: "열대",
};
