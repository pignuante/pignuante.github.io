/**
 * Build-time world grid bake.
 *
 * Rasterizes world-atlas 50m countries into an equirectangular grid PNG
 * that the travel map samples at runtime (no vector rasterization, no
 * world-atlas/topojson in the client bundle):
 *   R channel = country index (1-based, 0 = ocean)
 *   G channel = coast distance in grid cells (0.25°/cell, clamped 255)
 * plus a meta JSON with the per-index country table (biome/name/visited)
 * and the NaturalEarth1 fitExtent parameters the flat map uses.
 *
 * Outputs (committed artifacts):
 *   public/world-grid.png
 *   public/world-grid-meta.json
 *
 * Run: npm run bake:world
 */

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoBounds, geoCentroid, geoContains, geoNaturalEarth1 } from "d3-geo";
import { PNG } from "pngjs";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const GRID_W = 1440; // 0.25° per cell
const GRID_H = 720;

// Mirrors biomeFromLatitude in src/pages/travel/world-data.ts
function biomeFromLatitude(lat) {
  const absLat = Math.abs(lat);
  if (absLat > 60) return "polar";
  if (absLat > 45) return "continental";
  if (absLat < 23.5) return "tropical";
  return "temperate";
}

// ── Load sources ──
const topology = JSON.parse(
  fs.readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"),
);
const countries = feature(topology, topology.objects.countries).features;
const curated = new Map(
  JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "src/pages/travel/world-countries.json"),
      "utf8",
    ),
  ).map((entry) => [entry.id, entry]),
);

if (countries.length > 255) {
  throw new Error(`country count ${countries.length} exceeds uint8 range`);
}

// ── Country table (index order = feature order, 1-based in the grid) ──
const table = countries.map((f) => {
  const iso = f.id?.toString() ?? "";
  const entry = iso ? curated.get(iso) : undefined;
  const biome = entry?.biome ?? biomeFromLatitude(geoCentroid(f)[1]);
  return {
    iso,
    biome,
    ...(entry?.name && { name: entry.name }),
    ...(entry?.nameKo && { nameKo: entry.nameKo }),
    ...(entry?.visited && { visited: true }),
  };
});

// ── Rasterize: per-cell point-in-country with bbox prefilter ──
const bounds = countries.map((f) => geoBounds(f)); // [[w,s],[e,n]], w>e crosses antimeridian
const grid = new Uint8Array(GRID_W * GRID_H); // country index, 0 = ocean

function bboxContains([[w, s], [e, n]], lon, lat) {
  if (lat < s || lat > n) return false;
  return w <= e ? lon >= w && lon <= e : lon >= w || lon <= e;
}

console.log(`rasterizing ${GRID_W}x${GRID_H} cells over ${countries.length} countries...`);
const t0 = Date.now();
for (let row = 0; row < GRID_H; row++) {
  const lat = 90 - ((row + 0.5) / GRID_H) * 180;
  for (let col = 0; col < GRID_W; col++) {
    const lon = ((col + 0.5) / GRID_W) * 360 - 180;
    for (let i = 0; i < countries.length; i++) {
      if (!bboxContains(bounds[i], lon, lat)) continue;
      if (geoContains(countries[i], [lon, lat])) {
        grid[row * GRID_W + col] = i + 1;
        break;
      }
    }
  }
  if (row % 72 === 71) {
    console.log(`  ${Math.round(((row + 1) / GRID_H) * 100)}% (${Date.now() - t0}ms)`);
  }
}

// ── Coast distance: multi-source BFS from land into ocean ──
// X wraps (longitude), Y does not (poles). Distance unit = grid cells (0.25°).
const dist = new Int32Array(GRID_W * GRID_H).fill(-1);
const queue = new Int32Array(GRID_W * GRID_H);
let head = 0;
let tail = 0;
for (let i = 0; i < grid.length; i++) {
  if (grid[i] > 0) {
    dist[i] = 0;
    queue[tail++] = i;
  }
}
while (head < tail) {
  const idx = queue[head++];
  const row = Math.floor(idx / GRID_W);
  const col = idx % GRID_W;
  const next = dist[idx] + 1;
  const neighbors = [
    row > 0 ? idx - GRID_W : -1,
    row < GRID_H - 1 ? idx + GRID_W : -1,
    row * GRID_W + ((col + GRID_W - 1) % GRID_W),
    row * GRID_W + ((col + 1) % GRID_W),
  ];
  for (const n of neighbors) {
    if (n < 0 || dist[n] >= 0 || grid[n] > 0) continue;
    dist[n] = next;
    queue[tail++] = n;
  }
}

// ── Encode PNG ──
const png = new PNG({ width: GRID_W, height: GRID_H });
for (let i = 0; i < grid.length; i++) {
  const o = i * 4;
  png.data[o] = grid[i];
  png.data[o + 1] = grid[i] > 0 ? 0 : Math.min(Math.max(dist[i], 0), 255);
  png.data[o + 2] = 0;
  png.data[o + 3] = 255;
}
const pngPath = path.join(ROOT, "public/world-grid.png");
fs.writeFileSync(pngPath, PNG.sync.write(png, { colorType: 6 }));

// ── Meta JSON (includes flat-map NaturalEarth1 fit, same as the old runtime fitExtent) ──
const fitted = geoNaturalEarth1().fitExtent(
  [
    [4, 4],
    [956, 500],
  ],
  { type: "FeatureCollection", features: countries },
);
const meta = {
  gridW: GRID_W,
  gridH: GRID_H,
  degPerCell: 360 / GRID_W,
  naturalEarthFit: { scale: fitted.scale(), translate: fitted.translate() },
  countries: table,
};
const metaPath = path.join(ROOT, "public/world-grid-meta.json");
fs.writeFileSync(metaPath, JSON.stringify(meta) + "\n");

const landCells = grid.reduce((acc, v) => acc + (v > 0 ? 1 : 0), 0);
console.log(`done in ${Date.now() - t0}ms`);
console.log(`  land cells: ${landCells}/${grid.length} (${Math.round((landCells / grid.length) * 100)}%)`);
console.log(`  ${pngPath}: ${fs.statSync(pngPath).size} bytes`);
console.log(`  ${metaPath}: ${fs.statSync(metaPath).size} bytes`);
