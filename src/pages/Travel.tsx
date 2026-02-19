import { useCallback, useEffect, useRef, useState } from "react";
import type { Biome, ProjectedCountryMarker } from "./travel/types";
import SparkDivider from "../components/ui/SparkDivider";
import {
  BIOME_COLORS_CSS,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./travel/constants";
import { useDrag } from "./travel/useDrag";
import { useWorldPixelGrid } from "./travel/useWorldPixelGrid";
import { wrapX } from "./travel/utils";
import WorldPixelMap from "./travel/WorldPixelMap";

/** Biome legend entries in display order */
const BIOME_LEGEND: ReadonlyArray<{ biome: Biome; label: string }> = [
  { biome: "tropical", label: "열대 Tropical" },
  { biome: "arid", label: "건조 Arid" },
  { biome: "temperate", label: "온대 Temperate" },
  { biome: "continental", label: "대륙성 Continental" },
  { biome: "polar", label: "극지 Polar" },
];

/** Tooltip state with CSS-space coordinates */
interface TooltipState {
  cssX: number;
  cssY: number;
  marker: ProjectedCountryMarker;
}

/** Offset from marker dot to tooltip edge */
const TOOLTIP_GAP_PX = 12;
/** Border width of the canvas wrapper (Tailwind border-4 = 4px) */
const BORDER_WIDTH_PX = 4;

export default function Travel() {
  const grid = useWorldPixelGrid();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { isDragging, offsetX } = useDrag(canvasWrapperRef, WORLD_MAP_WIDTH);

  const isDraggingRef = useRef<boolean>(false);
  const offsetXRef = useRef<number>(0);

  useEffect(() => {
    isDraggingRef.current = isDragging;
    offsetXRef.current = offsetX;
  });

  const handleMarkerHover = useCallback(
    (marker: ProjectedCountryMarker | null) => {
      if (isDraggingRef.current || !marker) {
        setTooltip(null);
        return;
      }

      const canvas = canvasWrapperRef.current?.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / WORLD_MAP_WIDTH;
      const scaleY = rect.height / WORLD_MAP_HEIGHT;

      const wrappedX = wrapX(marker.x + offsetXRef.current, WORLD_MAP_WIDTH);

      setTooltip({
        cssX: wrappedX * scaleX,
        cssY: marker.y * scaleY,
        marker,
      });
    },
    [],
  );

  return (
    <section
      aria-labelledby="travel-page-title"
      className="mx-auto max-w-7xl pixel-dot-bg px-6 py-24"
    >
      <h1
        className="pixel-glow-pulse font-pixel text-base sm:text-lg md:text-2xl"
        id="travel-page-title"
        style={{ color: "var(--text-brand)" }}
      >
        <span aria-hidden="true">✈ </span>
        여행 지도
      </h1>
      <p
        className="mt-3 font-pixel-body text-sm sm:text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        픽셀 세계 지도 — 기후 바이옴 기반 색상
      </p>

      <SparkDivider className="mt-6" />

      <div className="mt-10 flex flex-col items-center">
        <div className="relative" style={{ imageRendering: "pixelated" }}>
          <div
            className="overflow-hidden border-4 border-[var(--border-default)] [&_canvas]:!h-auto [&_canvas]:!max-w-full"
            ref={canvasWrapperRef}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {grid ? (
              <WorldPixelMap
                grid={grid}
                offsetX={offsetX}
                onMarkerHover={handleMarkerHover}
              />
            ) : (
              <div className="flex h-[504px] w-[960px] items-center justify-center bg-[var(--surface)]">
                <span className="font-pixel text-xs text-[var(--text-secondary)]">
                  Loading world map...
                </span>
              </div>
            )}
          </div>

          {/* HTML overlay tooltip — renders OUTSIDE the canvas, never clipped */}
          {tooltip ? <MarkerTooltip tooltip={tooltip} /> : null}
        </div>

        {/* Drag hint */}
        <p
          className="mt-2 font-pixel-body text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          ← 드래그하여 지도 이동 →
        </p>

        {/* Biome legend — centered under the map */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 font-pixel-body text-xs">
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

/* ── HTML Overlay Tooltip ── */

function MarkerTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { cssX, cssY, marker } = tooltip;

  return (
    <div
      className="pointer-events-none absolute z-10 border-2 border-[var(--border-default)] bg-[var(--surface)] px-3 py-1.5 font-pixel-body text-xs shadow-sm"
      style={{
        left: cssX + BORDER_WIDTH_PX + TOOLTIP_GAP_PX,
        opacity: 0.95,
        top: cssY + BORDER_WIDTH_PX,
      }}
    >
      <p className="truncate font-bold text-[var(--text-primary)]">
        {marker.nameKo} ({marker.name}) ★
      </p>
    </div>
  );
}
