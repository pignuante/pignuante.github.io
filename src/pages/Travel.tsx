import type { Biome } from "./travel/types";
import { BIOME_COLORS_CSS } from "./travel/constants";
import { useWorldPixelGrid } from "./travel/useWorldPixelGrid";
import WorldPixelMap from "./travel/WorldPixelMap";

/** Biome legend entries in display order */
const BIOME_LEGEND: ReadonlyArray<{ biome: Biome; label: string }> = [
  { biome: "tropical", label: "열대 Tropical" },
  { biome: "arid", label: "건조 Arid" },
  { biome: "temperate", label: "온대 Temperate" },
  { biome: "continental", label: "대륙성 Continental" },
  { biome: "polar", label: "극지 Polar" },
];

export default function Travel() {
  const grid = useWorldPixelGrid();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-pixel text-3xl font-bold tracking-tight">
        여행 지도
      </h1>
      <p className="mt-2 font-pixel-body text-sm text-[var(--text-secondary)]">
        픽셀 세계 지도 — 기후 바이옴 기반 색상
      </p>

      <div className="mt-8 flex flex-col items-center">
        <div className="relative" style={{ imageRendering: "pixelated" }}>
          <div className="overflow-hidden border-4 border-[var(--border-default)] [&_canvas]:!h-auto [&_canvas]:!max-w-full">
            {grid ? (
              <WorldPixelMap grid={grid} />
            ) : (
              <div className="flex h-[368px] w-[648px] items-center justify-center bg-[var(--surface)]">
                <span className="font-pixel text-xs text-[var(--text-secondary)]">
                  Loading world map...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Biome legend — centered under the map */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 font-pixel-body text-xs">
          {BIOME_LEGEND.map(({ biome, label }) => (
            <div className="flex items-center gap-2" key={biome}>
              <span
                className="inline-block h-3 w-3"
                style={{ backgroundColor: BIOME_COLORS_CSS[biome] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
