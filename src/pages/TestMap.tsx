import { Suspense, lazy, useCallback, useRef, useState } from "react";
import type { HoveredCityInfo } from "./test-map/types";
import {
  COLOR_CANTON_BORDER_CSS,
  COLOR_CITY_UNVISITED_CSS,
  COLOR_CITY_VISITED_CSS,
  COLOR_LAND_CSS,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "./test-map/constants";

const SwissPixelMap = lazy(() => import("./test-map/SwissPixelMap"));

/** Tooltip state with CSS-space coordinates (scaled for actual canvas size) */
interface TooltipState {
  city: HoveredCityInfo["city"];
  cssX: number;
  cssY: number;
}

export default function TestMap() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleCityHover = useCallback((info: HoveredCityInfo | null) => {
    if (!info) {
      setTooltip(null);
      return;
    }

    // Measure actual canvas CSS size to account for DPR scaling
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / MAP_WIDTH;
    const scaleY = rect.height / MAP_HEIGHT;

    setTooltip({
      city: info.city,
      cssX: info.canvasX * scaleX,
      cssY: info.canvasY * scaleY,
    });
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-pixel text-3xl font-bold tracking-tight">
        Pixel Map Test
      </h1>
      <p className="mt-2 font-pixel-body text-sm text-[var(--text-secondary)]">
        Switzerland — PixiJS 8 + d3-geo + world-atlas (50m)
      </p>

      <div className="mt-8 flex justify-center">
        {/* position:relative container for the HTML overlay tooltip */}
        <div className="relative" style={{ imageRendering: "pixelated" }}>
          <div
            className="overflow-hidden border-4 border-[var(--border-default)]"
            ref={canvasWrapperRef}
          >
            <Suspense
              fallback={
                <div className="flex h-[400px] w-[600px] items-center justify-center bg-[var(--surface)]">
                  <span className="font-pixel text-xs text-[var(--text-secondary)]">
                    Loading map...
                  </span>
                </div>
              }
            >
              <SwissPixelMap onCityHover={handleCityHover} />
            </Suspense>
          </div>

          {/* HTML overlay tooltip — renders OUTSIDE the canvas, never clipped */}
          {tooltip ? <MapTooltip tooltip={tooltip} /> : null}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 font-pixel-body text-xs">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3"
            style={{ backgroundColor: COLOR_LAND_CSS }}
          />
          <span>Land (temperate)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3"
            style={{ backgroundColor: COLOR_CANTON_BORDER_CSS }}
          />
          <span>Canton border</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: COLOR_CITY_VISITED_CSS }}
          />
          <span>Visited city</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: COLOR_CITY_UNVISITED_CSS }}
          />
          <span>Unvisited city</span>
        </div>
      </div>
    </section>
  );
}

/* ── HTML Overlay Tooltip ── */

/** Offset from the city dot to the tooltip edge */
const TOOLTIP_GAP_PX = 14;
/** Border width of the canvas wrapper (must match Tailwind border-4 = 4px) */
const BORDER_WIDTH_PX = 4;

function MapTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { city, cssX, cssY } = tooltip;
  const label = `${city.nameKo} (${city.name})${city.visited ? " ★" : ""}`;

  return (
    <div
      className="pointer-events-none absolute z-10 border-2 border-[var(--border-default)] bg-[var(--surface)] px-3 py-1.5 font-pixel-body text-xs shadow-sm"
      style={{
        left: cssX + BORDER_WIDTH_PX + TOOLTIP_GAP_PX,
        opacity: 0.95,
        top: cssY + BORDER_WIDTH_PX,
      }}
    >
      <p className="truncate font-bold text-[var(--text-primary)]">{label}</p>
      {city.memo ? (
        <p className="mt-0.5 truncate text-[var(--text-secondary)]">
          {city.memo}
        </p>
      ) : null}
    </div>
  );
}
