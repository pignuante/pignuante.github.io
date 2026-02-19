/** Köppen-inspired biome categories for pixel map coloring */
export type Biome = "arid" | "continental" | "polar" | "temperate" | "tropical";

/** Pixel cell with biome-derived color */
export interface ColoredPixelCell {
  col: number;
  color: number; // PixiJS hex
  row: number;
}

/** Country boundary pixel (land cells that overlap a border stroke) */
export interface BoundaryPixel {
  col: number;
  row: number;
}

/** Rasterized world grid data */
export interface WorldPixelGridResult {
  boundaryPixels: BoundaryPixel[];
  cells: ColoredPixelCell[];
  cols: number;
  rows: number;
}

/** Country metadata for biome classification */
export interface CountryBiomeEntry {
  biome: Biome;
  id: string; // ISO 3166-1 numeric code
  nameKo: string;
  visited?: boolean;
}

/** Hover info from world map — reuses same pattern as swiss map */
export interface WorldHoveredInfo {
  canvasX: number;
  canvasY: number;
  countryName: string;
  countryNameKo: string;
  visited: boolean;
}
