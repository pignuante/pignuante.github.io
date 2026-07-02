/** Köppen-inspired biome categories for pixel map coloring */
export type Biome = "arid" | "continental" | "polar" | "temperate" | "tropical";

/** Composited screen-cell grid (see composite.ts) */
export interface WorldPixelGridResult {
  /**
   * All cell layers (ocean, land, visited tint, borders) baked into one
   * canvas, rendered as a single sprite. Rebuilding per-cell Graphics
   * every frame froze dragging — never render cells individually.
   */
  bakedCanvas: OffscreenCanvas;
  cols: number;
  rows: number;
  /** Cell flat index (row * cols + col) → ISO country ID for visited cells only */
  visitedCountryGrid: Map<number, string>;
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
