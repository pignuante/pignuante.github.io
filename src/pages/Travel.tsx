import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Biome,
  GlobeRotation,
  MapViewMode,
  ProjectedCountryMarker,
} from "./travel/types";
import SparkDivider from "../components/ui/SparkDivider";
import {
  BIOME_COLORS_CSS,
  GLOBE_INITIAL_LAMBDA,
  GLOBE_INITIAL_PHI,
  GLOBE_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from "./travel/constants";
import GlobePixelMap from "./travel/GlobePixelMap";
import { useDrag } from "./travel/useDrag";
import { useGlobeDrag } from "./travel/useGlobeDrag";
import { useGlobePixelGrid } from "./travel/useGlobePixelGrid";
import { useWorldPixelGrid } from "./travel/useWorldPixelGrid";
import { wrapX } from "./travel/utils";
import WorldPixelMap from "./travel/WorldPixelMap";

/* ── Constants ── */

/** Biome legend entries in display order */
const BIOME_LEGEND: ReadonlyArray<{ biome: Biome; label: string }> = [
  { biome: "tropical", label: "열대 Tropical" },
  { biome: "arid", label: "건조 Arid" },
  { biome: "temperate", label: "온대 Temperate" },
  { biome: "continental", label: "대륙성 Continental" },
  { biome: "polar", label: "극지 Polar" },
];

/** Globe initial rotation — centered on South Korea */
const GLOBE_INITIAL_ROTATION: GlobeRotation = {
  lambda: GLOBE_INITIAL_LAMBDA,
  phi: GLOBE_INITIAL_PHI,
};

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

/* ── Toggle button config ── */

const VIEW_MODE_OPTIONS: ReadonlyArray<{
  icon: string;
  label: string;
  mode: MapViewMode;
}> = [
  { icon: "🗺", label: "평면", mode: "flat" },
  { icon: "🌍", label: "지구본", mode: "globe" },
];

/* ── FlatMapView ── */

function FlatMapView() {
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
    <>
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

        {tooltip ? <MarkerTooltip tooltip={tooltip} /> : null}
      </div>

      <p
        className="mt-2 font-pixel-body text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        ← 드래그하여 지도 이동 →
      </p>
    </>
  );
}

/* ── GlobeMapView ── */

function GlobeMapView() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { isDragging, rotation } = useGlobeDrag(
    canvasWrapperRef,
    GLOBE_INITIAL_ROTATION,
  );
  const grid = useGlobePixelGrid(rotation);

  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
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
      const scale = rect.width / GLOBE_SIZE;

      setTooltip({
        cssX: marker.x * scale,
        cssY: marker.y * scale,
        marker,
      });
    },
    [],
  );

  return (
    <>
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
            <GlobePixelMap grid={grid} onMarkerHover={handleMarkerHover} />
          ) : (
            <div className="flex h-[720px] w-[720px] items-center justify-center bg-[var(--surface)]">
              <span className="font-pixel text-xs text-[var(--text-secondary)]">
                Loading globe...
              </span>
            </div>
          )}
        </div>

        {tooltip ? <MarkerTooltip tooltip={tooltip} /> : null}
      </div>

      <p
        className="mt-2 font-pixel-body text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        드래그하여 지구본 회전
      </p>
    </>
  );
}

/* ── Main page component ── */

export default function Travel() {
  const [viewMode, setViewMode] = useState<MapViewMode>("flat");

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

      {/* View mode toggle */}
      <div className="mt-6 flex justify-center gap-2">
        {VIEW_MODE_OPTIONS.map(({ icon, label, mode }) => (
          <button
            aria-pressed={viewMode === mode}
            className="border-2 px-3 py-1.5 font-pixel-body text-xs transition-colors"
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              backgroundColor:
                viewMode === mode ? "var(--surface)" : "transparent",
              borderColor:
                viewMode === mode ? "var(--border-default)" : "transparent",
              color:
                viewMode === mode
                  ? "var(--text-brand)"
                  : "var(--text-secondary)",
              cursor: viewMode === mode ? "default" : "pointer",
            }}
            type="button"
          >
            <span aria-hidden="true">{icon} </span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center">
        {viewMode === "flat" ? <FlatMapView /> : <GlobeMapView />}

        {/* Biome legend — shared across both views */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 font-pixel-body text-xs">
          {BIOME_LEGEND.map(({ biome, label }) => (
            <div className="flex items-center gap-2" key={biome}>
              <span
                className="inline-block h-3 w-3"
                style={{ backgroundColor: BIOME_COLORS_CSS[biome] }}
              />
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── HTML Overlay Tooltip (shared) ── */

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
