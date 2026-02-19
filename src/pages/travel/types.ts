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
  markers: ProjectedCountryMarker[];
  rows: number;
}

/** Country metadata for biome classification */
export interface CountryBiomeEntry {
  biome: Biome;
  id: string; // ISO 3166-1 numeric code
  name: string; // English name
  nameKo: string;
  visited?: boolean;
}

/** Country marker with projected pixel coordinates */
export interface ProjectedCountryMarker {
  id: string;
  name: string;
  nameKo: string;
  visited: boolean;
  x: number; // projected canvas-space X
  y: number; // projected canvas-space Y
}
