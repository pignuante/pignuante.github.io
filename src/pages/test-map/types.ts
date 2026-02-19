export interface PixelCell {
  col: number;
  row: number;
}

export interface CityMarker {
  coords: [number, number]; // [lng, lat] — d3-geo convention
  memo?: string;
  name: string;
  nameKo: string;
  visited: boolean;
}

/** City with projected pixel coordinates in inner-map space */
export type ProjectedCity = CityMarker & { x: number; y: number };

export interface PixelGridResult {
  boundaryPixels: PixelCell[];
  cells: PixelCell[];
  cityPixels: ProjectedCity[];
  cols: number;
  rows: number;
}

/** Hover info with canvas-space coordinates for HTML overlay positioning */
export interface HoveredCityInfo {
  /** Canvas-space X (inner x + MAP_PADDING) */
  canvasX: number;
  /** Canvas-space Y (inner y + MAP_PADDING) */
  canvasY: number;
  city: ProjectedCity;
}
