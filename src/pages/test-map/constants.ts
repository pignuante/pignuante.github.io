/** Pixel cell size in screen pixels */
export const CELL_SIZE = 4;

/** Canvas dimensions for the map viewport */
export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 400;

/** Padding around the country silhouette (in pixels) */
export const MAP_PADDING = 24;

/** Switzerland ISO 3166-1 numeric code */
export const SWISS_NUMERIC_CODE = "756";

/* ── Color palette (PixiJS hex) ── */

/** Land fill — temperate green */
export const COLOR_LAND = 0x3c_b3_71;

/** Visited city marker */
export const COLOR_CITY_VISITED = 0xff_6b_6b;

/** Unvisited city marker */
export const COLOR_CITY_UNVISITED = 0x99_99_99;

/** Canton boundary line — dark forest green */
export const COLOR_CANTON_BORDER = 0x22_7a_4b;

/** Hover highlight brightness boost (additive hex) */
export const COLOR_HOVER_BOOST = 0x1a_1a_1a;

/** City inner dot color */
export const COLOR_CITY_INNER = 0x1c_19_17;

/* ── Color palette (CSS hex for HTML elements) ── */

/** Helper: convert PixiJS numeric hex to CSS string */
const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

export const COLOR_LAND_CSS = toHex(COLOR_LAND);
export const COLOR_CANTON_BORDER_CSS = toHex(COLOR_CANTON_BORDER);
export const COLOR_CITY_VISITED_CSS = toHex(COLOR_CITY_VISITED);
export const COLOR_CITY_UNVISITED_CSS = toHex(COLOR_CITY_UNVISITED);

/* ── Interaction constants ── */

/** City marker radius in pixels */
export const CITY_DOT_RADIUS = 6;

/** Hit-test radius multiplier (hit radius = DOT_RADIUS * multiplier) */
export const CITY_HIT_RADIUS_MULTIPLIER = 2;

/** Hover highlight radius from city center (in pixels) */
export const HOVER_HIGHLIGHT_RADIUS = 40;

/** Hover ring padding beyond dot radius (in pixels) */
export const HOVER_RING_PADDING = 3;

/* ── Background grid ── */

/** Background dot grid spacing (in pixels) */
export const BG_GRID_SPACING = 8;

/** Background dot radius (in pixels) */
export const BG_DOT_RADIUS = 0.5;
