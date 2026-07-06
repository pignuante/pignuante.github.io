import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Biome,
  CountryHoverInfo,
  GlobeRotation,
  MapViewMode,
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
import { useGlobeDrag } from "./travel/useGlobeDrag";
import { useGlobePixelGrid } from "./travel/useGlobePixelGrid";
import { useMapCamera } from "./travel/useMapCamera";
import { useWorldPixelGrid } from "./travel/useWorldPixelGrid";
import { useZoom } from "./travel/useZoom";
import WorldPixelMap from "./travel/WorldPixelMap";

/* ── Constants ── */

/** Biome legend entries in display order */
const BIOME_LEGEND: ReadonlyArray<{ biome: Biome; label: string }> = [
  { biome: "tropical", label: "정글 지대" },
  { biome: "arid", label: "사막 지대" },
  { biome: "temperate", label: "초원 지대" },
  { biome: "continental", label: "대륙 지대" },
  { biome: "polar", label: "빙원 지대" },
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
  nameKo: string;
}

/** Offset from pointer to tooltip edge */
const TOOLTIP_GAP_PX = 12;
/** Border width of the canvas wrapper (Tailwind border-4 = 4px) */
const BORDER_WIDTH_PX = 4;

/* ── Toggle button config ── */

const VIEW_MODE_OPTIONS: ReadonlyArray<{
  icon: string;
  label: string;
  mode: MapViewMode;
}> = [
  { icon: "📜", label: "양피지", mode: "flat" },
  { icon: "🔮", label: "수정구", mode: "globe" },
];

/* ── FlatMapView ── */

function FlatMapView() {
  const grid = useWorldPixelGrid();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  const { isDragging, offsetX, offsetY, zoom } = useMapCamera(
    canvasWrapperRef,
    WORLD_MAP_WIDTH,
    WORLD_MAP_HEIGHT,
  );

  const isDraggingRef = useRef<boolean>(false);

  /** Sync latest drag state → ref after every render */
  useEffect(() => {
    isDraggingRef.current = isDragging;
  });

  const handleCountryHover = useCallback((info: CountryHoverInfo | null) => {
    if (isDraggingRef.current || !info) {
      setHoveredCountryId(null);
      setTooltip(null);
      return;
    }

    setHoveredCountryId(info.id);

    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / WORLD_MAP_WIDTH;
    const scaleY = rect.height / WORLD_MAP_HEIGHT;

    setTooltip({
      cssX: info.stageX * scaleX,
      cssY: info.stageY * scaleY,
      nameKo: info.nameKo,
    });
  }, []);

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
              hoveredCountryId={hoveredCountryId}
              offsetX={offsetX}
              offsetY={offsetY}
              onCountryHover={handleCountryHover}
              zoom={zoom}
            />
          ) : (
            <div className="flex h-[504px] w-[960px] items-center justify-center bg-[var(--surface)]">
              <span className="font-pixel text-xs text-[var(--text-secondary)]">
                양피지를 펼치는 중...
              </span>
            </div>
          )}
        </div>

        {tooltip ? <CountryTooltip tooltip={tooltip} /> : null}
      </div>

      <p
        className="mt-2 font-pixel-body text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        ← 양피지를 끌어 탐험 · 스크롤로 확대/축소 →
      </p>
    </>
  );
}

/* ── GlobeMapView ── */

function GlobeMapView() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  const { isDragging, rotation } = useGlobeDrag(
    canvasWrapperRef,
    GLOBE_INITIAL_ROTATION,
  );
  const grid = useGlobePixelGrid(rotation);
  const { zoom } = useZoom(canvasWrapperRef);

  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  });

  const handleCountryHover = useCallback((info: CountryHoverInfo | null) => {
    if (isDraggingRef.current || !info) {
      setHoveredCountryId(null);
      setTooltip(null);
      return;
    }

    setHoveredCountryId(info.id);

    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / GLOBE_SIZE;

    setTooltip({
      cssX: info.stageX * scale,
      cssY: info.stageY * scale,
      nameKo: info.nameKo,
    });
  }, []);

  return (
    <>
      <div
        className="relative max-h-[70vh] max-w-[70vh]"
        style={{
          aspectRatio: "1",
          imageRendering: "pixelated",
          width: GLOBE_SIZE,
        }}
      >
        <div
          className="overflow-hidden border-4 border-[var(--border-default)] [&_canvas]:!h-auto [&_canvas]:!max-w-full"
          ref={canvasWrapperRef}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {grid ? (
            <GlobePixelMap
              grid={grid}
              hoveredCountryId={hoveredCountryId}
              onCountryHover={handleCountryHover}
              zoom={zoom}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
              <span className="font-pixel text-xs text-[var(--text-secondary)]">
                수정구에 세계를 비추는 중...
              </span>
            </div>
          )}
        </div>

        {tooltip ? <CountryTooltip tooltip={tooltip} /> : null}
      </div>

      <p
        className="mt-2 font-pixel-body text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        수정구를 돌려 세계를 탐험 · 스크롤로 확대/축소
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
        <span aria-hidden="true">★ </span>
        WORLD MAP
      </h1>
      <p
        className="mt-3 font-pixel-body text-sm sm:text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        모험가의 발자취가 새겨진 세계 지도
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

function CountryTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { cssX, cssY, nameKo } = tooltip;

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
        ✦ {nameKo} — 탐험 완료
      </p>
    </div>
  );
}
