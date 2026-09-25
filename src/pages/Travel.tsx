import { geoDistance, geoNaturalEarth1 } from "d3-geo";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HereMarker } from "./travel/HereOverlay";
import type {
  Biome,
  CountryHoverInfo,
  GlobeRotation,
  MapViewMode,
} from "./travel/types";
import SparkDivider from "../components/ui/SparkDivider";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  BIOME_COLORS_CSS,
  GLOBE_INITIAL_LAMBDA,
  GLOBE_CELL_SIZE,
  GLOBE_INITIAL_PHI,
  GLOBE_SIZE,
  WORLD_MAP_HEIGHT,
  WORLD_CELL_SIZE,
  WORLD_MAP_WIDTH,
} from "./travel/constants";
import GlobePixelMap from "./travel/GlobePixelMap";
import { PIN_ROWS, pinPixelSize } from "./travel/herePin";
import { useGlobeDrag } from "./travel/useGlobeDrag";
import {
  createGlobeProjection,
  useGlobePixelGrid,
} from "./travel/useGlobePixelGrid";
import { useMapCamera } from "./travel/useMapCamera";
import { usePixelSnappedWidth } from "./travel/usePixelSnappedWidth";
import { useWorldGridData } from "./travel/useWorldGridData";
import { useWorldPixelGrid } from "./travel/useWorldPixelGrid";
import { useZoom } from "./travel/useZoom";
import {
  countryName,
  gridCountryIndex,
  useVisitorLocation,
  type PreciseStatus,
  type VisitorLocation,
} from "./travel/visitorLocation";
import WorldPixelMap from "./travel/WorldPixelMap";
import { cellDevicePixels } from "./travel/zoomMath";

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

/** The globe box is at most this share of the viewport height. */
const GLOBE_MAX_VIEWPORT_HEIGHT_RATIO = 0.7;
// The canvas (inside the border) may reach its full logical size, so a roomy
// 1x display shows the globe at 1:1.
const globeMaxWidth = (): number =>
  Math.min(
    GLOBE_SIZE,
    window.innerHeight * GLOBE_MAX_VIEWPORT_HEIGHT_RATIO - 2 * BORDER_WIDTH_PX,
  );

/* ── Toggle button config ── */

/** Tailwind's sm breakpoint (40rem): below it the globe is the default view. */
const MOBILE_MAP_QUERY = "(width < 40rem)";

const VIEW_MODE_OPTIONS: ReadonlyArray<{
  icon: string;
  label: string;
  mode: MapViewMode;
}> = [
  { icon: "📜", label: "양피지", mode: "flat" },
  { icon: "🔮", label: "수정구", mode: "globe" },
];

/** What both map views need to draw the visitor pin */
interface VisitorView {
  countryIndex: number;
  location: null | VisitorLocation;
  pulse: boolean;
}

/* ── FlatMapView ── */

function FlatMapView({ visitor }: { visitor: VisitorView }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const snapped = usePixelSnappedWidth(measureRef, {
    cells: WORLD_MAP_WIDTH / WORLD_CELL_SIZE,
    inset: 2 * BORDER_WIDTH_PX,
    logicalWidth: WORLD_MAP_WIDTH,
  });
  const grid = useWorldPixelGrid();
  const worldData = useWorldGridData();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  const { isDragging, offsetX, offsetY, zoom } = useMapCamera(
    canvasWrapperRef,
    WORLD_MAP_WIDTH,
    WORLD_MAP_HEIGHT,
    cellDevicePixels(WORLD_CELL_SIZE, snapped?.resolution),
  );

  const here = useMemo<HereMarker | null>(() => {
    if (!visitor.location || !worldData) return null;
    const [lat, lon] = visitor.location.point;
    const projected = geoNaturalEarth1()
      .scale(worldData.naturalEarthFit.scale)
      .translate(worldData.naturalEarthFit.translate)([lon, lat]);
    return {
      countryIndex: visitor.countryIndex,
      point: projected ? { x: projected[0], y: projected[1] } : null,
    };
  }, [visitor.countryIndex, visitor.location, worldData]);

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
    <div className="w-full" ref={measureRef}>
      <div
        className="relative mx-auto"
        style={{
          imageRendering: "pixelated",
          width:
            snapped === null ? undefined : snapped.width + 2 * BORDER_WIDTH_PX,
        }}
      >
        <div
          className="overflow-hidden border-4 border-[var(--border-default)] [&_canvas]:!h-auto [&_canvas]:!w-full"
          ref={canvasWrapperRef}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {grid ? (
            <WorldPixelMap
              grid={grid}
              here={here}
              herePinPixel={pinPixelSize(
                (snapped?.width ?? WORLD_MAP_WIDTH) / WORLD_MAP_WIDTH,
              )}
              herePulse={visitor.pulse}
              hoveredCountryId={hoveredCountryId}
              offsetX={offsetX}
              offsetY={offsetY}
              onCountryHover={handleCountryHover}
              resolution={snapped?.resolution}
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
        className="mt-2 font-pixel-small text-[12px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        ← 양피지를 끌어 탐험 · 스크롤로 확대/축소 →
      </p>
    </div>
  );
}

/* ── GlobeMapView ── */

function GlobeMapView({ visitor }: { visitor: VisitorView }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const snapped = usePixelSnappedWidth(measureRef, {
    cells: GLOBE_SIZE / GLOBE_CELL_SIZE,
    inset: 2 * BORDER_WIDTH_PX,
    logicalWidth: GLOBE_SIZE,
    maxWidth: globeMaxWidth,
  });
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  // Start with the visitor's location facing the viewer.
  const [initialRotation] = useState<GlobeRotation>(() => {
    if (!visitor.location) return GLOBE_INITIAL_ROTATION;
    const [lat, lon] = visitor.location.point;
    return { lambda: ((lon % 360) + 360) % 360, phi: lat };
  });
  const { isDragging, recenter, rotation } = useGlobeDrag(
    canvasWrapperRef,
    initialRotation,
  );
  // A precise position arrives later; turn to it unless the visitor has
  // already rotated the globe themselves.
  useEffect(() => {
    if (visitor.location?.source !== "precise") return;
    const [lat, lon] = visitor.location.point;
    recenter({ lambda: ((lon % 360) + 360) % 360, phi: lat });
  }, [recenter, visitor.location]);
  const grid = useGlobePixelGrid(rotation);
  const { zoom } = useZoom(
    canvasWrapperRef,
    cellDevicePixels(GLOBE_CELL_SIZE, snapped?.resolution),
  );
  const herePinPixel = pinPixelSize(
    (snapped?.width ?? GLOBE_SIZE) / GLOBE_SIZE,
  );

  const here = useMemo<HereMarker | null>(() => {
    if (!visitor.location) return null;
    const [lat, lon] = visitor.location.point;
    // Hide the pin on the far hemisphere (orthographic clipAngle 90), and
    // early enough that the bitmap stays inside the disc: a point at angle a
    // from the centre projects at radius R·sin(a), so the pin's height h
    // fits while sin(a) <= 1 - h/R.
    const radius = GLOBE_SIZE / 2;
    const pinHeight = (PIN_ROWS.length * herePinPixel) / zoom;
    const angle = geoDistance([lon, lat], [rotation.lambda, rotation.phi]);
    const onFront =
      angle < Math.PI / 2 && Math.sin(angle) <= 1 - pinHeight / radius;
    const projected = onFront
      ? createGlobeProjection(rotation.lambda, rotation.phi)([lon, lat])
      : null;
    return {
      countryIndex: visitor.countryIndex,
      point: projected ? { x: projected[0], y: projected[1] } : null,
    };
  }, [
    herePinPixel,
    rotation.lambda,
    rotation.phi,
    visitor.countryIndex,
    visitor.location,
    zoom,
  ]);

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
    <div className="w-full" ref={measureRef}>
      <div
        className="relative mx-auto"
        style={{
          aspectRatio: "1",
          imageRendering: "pixelated",
          maxHeight: `${GLOBE_MAX_VIEWPORT_HEIGHT_RATIO * 100}vh`,
          maxWidth: `min(100%, ${GLOBE_MAX_VIEWPORT_HEIGHT_RATIO * 100}vh)`,
          width:
            snapped === null
              ? GLOBE_SIZE + 2 * BORDER_WIDTH_PX
              : snapped.width + 2 * BORDER_WIDTH_PX,
        }}
      >
        <div
          className="overflow-hidden border-4 border-[var(--border-default)] [&_canvas]:!h-auto [&_canvas]:!w-full"
          ref={canvasWrapperRef}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {grid ? (
            <GlobePixelMap
              grid={grid}
              here={here}
              herePinPixel={herePinPixel}
              herePulse={visitor.pulse}
              hoveredCountryId={hoveredCountryId}
              onCountryHover={handleCountryHover}
              resolution={snapped?.resolution}
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
        className="mt-2 font-pixel-small text-[12px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        수정구를 돌려 세계를 탐험 · 스크롤로 확대/축소
      </p>
    </div>
  );
}

/* ── Main page component ── */

export default function Travel() {
  // The flat map is ~1.9:1, so on a phone it shrinks to a thin strip; the
  // square globe uses the width better there. Until the visitor picks a
  // view, the default follows the viewport.
  const isNarrowViewport = useMediaQuery(MOBILE_MAP_QUERY);
  const [chosenViewMode, setViewMode] = useState<MapViewMode | null>(null);
  const viewMode: MapViewMode =
    chosenViewMode ?? (isNarrowViewport ? "globe" : "flat");

  const worldData = useWorldGridData();
  const { canRequestPrecise, location, preciseStatus, requestPrecise } =
    useVisitorLocation(worldData);
  const countryIndex =
    location && worldData
      ? gridCountryIndex(worldData, location.countryCode)
      : 0;
  // Prefer the map's own Korean name (matches hover tooltips: "호주"), then
  // the browser's ("HK" -> "홍콩") for places the map data does not name.
  const visitorCountryName = location?.countryCode
    ? ((countryIndex > 0
        ? worldData?.countries[countryIndex - 1].nameKo
        : undefined) ?? countryName(location.countryCode))
    : undefined;
  const visitor: VisitorView = {
    countryIndex,
    location,
    pulse: !useReducedMotion(),
  };

  return (
    <section
      aria-labelledby="travel-page-title"
      className="mx-auto max-w-7xl pixel-dot-bg py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h1
          className="pixel-glow-pulse font-pixel text-[24px]"
          id="travel-page-title"
          style={{ color: "var(--text-brand)" }}
        >
          <span aria-hidden="true">★ </span>
          WORLD MAP
        </h1>
        <p
          className="mt-3 font-pixel-body text-[15px]"
          style={{ color: "var(--text-secondary)" }}
        >
          모험가의 발자취가 새겨진 세계 지도
        </p>

        <SparkDivider className="mt-6" />
      </div>

      {/* View mode toggle */}
      <div className="mt-6 flex justify-center gap-2 px-6">
        {VIEW_MODE_OPTIONS.map(({ icon, label, mode }) => (
          <button
            aria-pressed={viewMode === mode}
            className="border-2 px-3 py-1.5 font-pixel-small text-[12px] transition-colors"
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

      <div className="mt-10 flex flex-col items-center px-6">
        {viewMode === "flat" ? (
          <FlatMapView visitor={visitor} />
        ) : (
          <GlobeMapView visitor={visitor} />
        )}

        {/* Biome legend — shared across both views */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 font-pixel-small text-[12px]">
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

        <VisitorLocationNote
          canRequestPrecise={canRequestPrecise}
          countryName={visitorCountryName}
          location={location}
          onRequestPrecise={requestPrecise}
          preciseStatus={preciseStatus}
        />
      </div>
    </section>
  );
}

/* ── HTML Overlay Tooltip (shared) ── */

const PRECISE_STATUS_TEXT: Partial<Record<PreciseStatus, string>> = {
  denied: "위치 권한이 거부되어 시간대 기준으로 표시해요.",
  locating: "위치를 확인하는 중…",
  ok: "현재 위치로 옮겼어요. 아주 작은 나라 안이라면 이웃 나라로 표시될 수 있어요.",
  unavailable: "정확한 위치를 가져오지 못했어요.",
};

/** "You are here" line under the maps, plus the opt-in precise button. */
function VisitorLocationNote({
  canRequestPrecise,
  countryName,
  location,
  onRequestPrecise,
  preciseStatus,
}: {
  canRequestPrecise: boolean;
  countryName: string | undefined;
  location: null | VisitorLocation;
  onRequestPrecise: () => void;
  preciseStatus: PreciseStatus;
}) {
  const where = location
    ? `${countryName ?? "바다 위 어딘가"} · ${
        location.source === "precise" ? "현재 위치 기준" : "시간대 기준"
      }`
    : "시간대로는 위치를 알 수 없어요";
  const statusText = PRECISE_STATUS_TEXT[preciseStatus];

  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <p
        aria-live="polite"
        className="font-pixel-body text-[15px]"
        style={{ color: "var(--text-primary)" }}
      >
        <span aria-hidden="true">📍 </span>지금 접속 위치: {where}
      </p>
      {canRequestPrecise && location?.source !== "precise" ? (
        <button
          className="pixel-btn font-pixel-small text-[12px] hover:pixel-btn-hover active:pixel-btn-active"
          disabled={preciseStatus === "locating"}
          onClick={onRequestPrecise}
          type="button"
        >
          정확한 위치 보기
        </button>
      ) : null}
      <p
        aria-live="polite"
        className="font-pixel-small text-[12px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {statusText ??
          "위치는 이 브라우저 안에서만 쓰이고 저장하거나 보내지 않아요."}
      </p>
    </div>
  );
}

function CountryTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { cssX, cssY, nameKo } = tooltip;

  return (
    <div
      className="pointer-events-none absolute z-10 border-2 border-[var(--border-default)] bg-[var(--surface)] px-3 py-1.5 font-pixel-small text-[12px] shadow-sm"
      style={{
        left: cssX + BORDER_WIDTH_PX + TOOLTIP_GAP_PX,
        opacity: 0.95,
        top: cssY + BORDER_WIDTH_PX,
      }}
    >
      <p className="truncate font-bold text-[var(--text-primary)]">
        <span aria-hidden="true">✦ </span>
        {nameKo} — 탐험 완료
      </p>
    </div>
  );
}
