import { useEffect, useState } from "react";
import type { Biome } from "./types";

/** Per-country metadata from world-grid-meta.json (index order = grid R channel - 1) */
export interface WorldGridCountry {
  biome: Biome;
  iso: string;
  name?: string;
  nameKo?: string;
  visited?: boolean;
}

/** Decoded build-time world grid (see scripts/bake-world-grid.mjs) */
export interface WorldGridData {
  /** Ocean coast distance per cell, in grid cells (degPerCell each); 0 on land */
  coastCells: Uint8Array;
  countries: WorldGridCountry[];
  /** 1-based country index per cell, 0 = ocean */
  countryIdx: Uint8Array;
  degPerCell: number;
  gridH: number;
  gridW: number;
  naturalEarthFit: { scale: number; translate: [number, number] };
}

let cache: Promise<WorldGridData> | null = null;

async function loadWorldGridData(): Promise<WorldGridData> {
  const base = import.meta.env.BASE_URL;
  const [meta, imageResponse] = await Promise.all([
    fetch(`${base}world-grid-meta.json`).then(
      (r) =>
        r.json() as Promise<Omit<WorldGridData, "coastCells" | "countryIdx">>,
    ),
    fetch(`${base}world-grid.png`),
  ]);

  // Decode exactly: no premultiply / color conversion (channels are data, not color)
  const bitmap = await createImageBitmap(await imageResponse.blob(), {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const canvas = new OffscreenCanvas(meta.gridW, meta.gridH);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable for world grid decode");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const rgba = ctx.getImageData(0, 0, meta.gridW, meta.gridH).data;
  const size = meta.gridW * meta.gridH;
  const countryIdx = new Uint8Array(size);
  const coastCells = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    countryIdx[i] = rgba[i * 4];
    coastCells[i] = rgba[i * 4 + 1];
  }

  return { ...meta, coastCells, countryIdx };
}

/** Load the pre-baked world grid once (module-level cache, shared by flat map + globe) */
export function useWorldGridData(): WorldGridData | null {
  const [data, setData] = useState<WorldGridData | null>(null);

  useEffect(() => {
    let active = true;
    cache ??= loadWorldGridData();
    void cache.then((value) => {
      if (active) setData(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
