/** Köppen-inspired biome categories for pixel map coloring */
export type Biome = "arid" | "continental" | "polar" | "temperate" | "tropical";

/** Pixel cell with biome-derived color */
export interface ColoredPixelCell {
  col: number;
  color: number; // PixiJS hex
  row: number;
  visited?: boolean;
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
  /** Ocean cells: latitude biome + coast-distance gradient + wave pattern */
  oceanCells?: ColoredPixelCell[];
  rows: number;
  /** Cell flat index (row * cols + col) → ISO country ID for visited cells only */
  visitedCountryGrid?: Map<number, string>;
}

/** Country metadata for biome classification */
export interface CountryBiomeEntry {
  biome: Biome;
  id: string; // ISO 3166-1 numeric code
  name: string; // English name
  nameKo: string;
  visited?: boolean;
}

/** Hover info passed from PixiJS interaction layer to parent */
export interface CountryHoverInfo {
  id: string;
  name: string;
  nameKo: string;
  /** Pointer position in stage-space X */
  stageX: number;
  /** Pointer position in stage-space Y */
  stageY: number;
}

/** Globe rotation angles in degrees (positive values) */
export interface GlobeRotation {
  /** Longitude of the center point (0–360) */
  lambda: number;
  /** Latitude of the center point (-90–90) */
  phi: number;
}

/** Map view mode for flat ↔ globe toggle */
export type MapViewMode = "flat" | "globe";
