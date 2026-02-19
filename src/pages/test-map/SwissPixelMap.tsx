import type { FederatedPointerEvent } from "pixi.js";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, TextStyle } from "pixi.js";
import { useCallback, useState } from "react";
import type { HoveredCityInfo, PixelGridResult, ProjectedCity } from "./types";
import {
  BG_DOT_RADIUS,
  BG_GRID_SPACING,
  CELL_SIZE,
  CITY_DOT_RADIUS,
  CITY_HIT_RADIUS_MULTIPLIER,
  COLOR_CANTON_BORDER,
  COLOR_CITY_INNER,
  COLOR_CITY_UNVISITED,
  COLOR_CITY_VISITED,
  COLOR_HOVER_BOOST,
  COLOR_LAND,
  HOVER_HIGHLIGHT_RADIUS,
  HOVER_RING_PADDING,
  MAP_HEIGHT,
  MAP_PADDING,
  MAP_WIDTH,
} from "./constants";
import { SWISS_CITIES } from "./swiss-data";
import { useGeoPixelGrid } from "./useGeoPixelGrid";

// Register PixiJS components for @pixi/react
extend({ Container, Graphics });

/** Squared hit-test radius for city detection */
const HIT_RADIUS_SQ = (CITY_DOT_RADIUS * CITY_HIT_RADIUS_MULTIPLIER) ** 2;

/** Squared hover highlight radius */
const HOVER_RADIUS_SQ = HOVER_HIGHLIGHT_RADIUS ** 2;

/* ── Sub-components ── */

function LandGrid({ grid }: { grid: PixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const cell of grid.cells) {
        const x = cell.col * CELL_SIZE;
        const y = cell.row * CELL_SIZE;
        g.rect(x, y, CELL_SIZE - 1, CELL_SIZE - 1).fill(COLOR_LAND);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} x={MAP_PADDING} y={MAP_PADDING} />;
}

function CantonBoundaries({ grid }: { grid: PixelGridResult }) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const cell of grid.boundaryPixels) {
        const x = cell.col * CELL_SIZE;
        const y = cell.row * CELL_SIZE;
        g.rect(x, y, CELL_SIZE - 1, CELL_SIZE - 1).fill(COLOR_CANTON_BORDER);
      }
    },
    [grid],
  );

  return <pixiGraphics draw={draw} x={MAP_PADDING} y={MAP_PADDING} />;
}

function CityDots({
  grid,
  onHover,
}: {
  grid: PixelGridResult;
  onHover: (city: ProjectedCity | null) => void;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      for (const city of grid.cityPixels) {
        const color = city.visited ? COLOR_CITY_VISITED : COLOR_CITY_UNVISITED;

        // Outer ring
        g.circle(city.x, city.y, CITY_DOT_RADIUS).fill(color);

        // Inner dot
        g.circle(city.x, city.y, 2).fill(COLOR_CITY_INNER);
      }
    },
    [grid],
  );

  const handlePointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      const localX = e.global.x - MAP_PADDING;
      const localY = e.global.y - MAP_PADDING;

      const hit = grid.cityPixels.find((c) => {
        const dx = c.x - localX;
        const dy = c.y - localY;
        return dx * dx + dy * dy <= HIT_RADIUS_SQ;
      });

      onHover(hit ?? null);
    },
    [grid, onHover],
  );

  const handlePointerLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <pixiGraphics
      draw={draw}
      eventMode="static"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      x={MAP_PADDING}
      y={MAP_PADDING}
    />
  );
}

function HoverHighlight({
  grid,
  hoveredCity,
}: {
  grid: PixelGridResult;
  hoveredCity: ProjectedCity | null;
}) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!hoveredCity) return;

      // Highlight nearby land cells (squared distance — no sqrt needed)
      for (const cell of grid.cells) {
        const cx = cell.col * CELL_SIZE + CELL_SIZE / 2;
        const cy = cell.row * CELL_SIZE + CELL_SIZE / 2;
        const dx = cx - hoveredCity.x;
        const dy = cy - hoveredCity.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < HOVER_RADIUS_SQ) {
          const x = cell.col * CELL_SIZE;
          const y = cell.row * CELL_SIZE;
          g.rect(x, y, CELL_SIZE - 1, CELL_SIZE - 1).fill({
            alpha: 0.3,
            color: COLOR_HOVER_BOOST,
          });
        }
      }

      // Highlight ring around city
      g.circle(
        hoveredCity.x,
        hoveredCity.y,
        CITY_DOT_RADIUS + HOVER_RING_PADDING,
      ).stroke({
        color: 0xff_ff_ff,
        width: 2,
      });
    },
    [grid, hoveredCity],
  );

  return <pixiGraphics draw={draw} x={MAP_PADDING} y={MAP_PADDING} />;
}

/* ── Background grid pattern ── */
function BackgroundGrid() {
  const draw = useCallback((g: Graphics) => {
    g.clear();

    for (let x = 0; x < MAP_WIDTH; x += BG_GRID_SPACING) {
      for (let y = 0; y < MAP_HEIGHT; y += BG_GRID_SPACING) {
        g.circle(x, y, BG_DOT_RADIUS).fill({
          alpha: 0.15,
          color: COLOR_CITY_INNER,
        });
      }
    }
  }, []);

  return <pixiGraphics draw={draw} />;
}

/* ── Loading state ── */
function LoadingText() {
  return (
    <pixiText
      style={
        new TextStyle({
          fill: 0x57_53_4e,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 12,
        })
      }
      text="Loading map..."
      x={MAP_WIDTH / 2 - 60}
      y={MAP_HEIGHT / 2}
    />
  );
}

/* ── Props ── */
interface SwissPixelMapProps {
  onCityHover?: (info: HoveredCityInfo | null) => void;
}

/* ── Main component ── */
export default function SwissPixelMap({ onCityHover }: SwissPixelMapProps) {
  const grid = useGeoPixelGrid(SWISS_CITIES);

  // Internal state for PixiJS HoverHighlight (must stay in canvas)
  const [hoveredCity, setHoveredCity] = useState<ProjectedCity | null>(null);

  const handleHover = useCallback(
    (city: ProjectedCity | null) => {
      setHoveredCity(city);

      // Notify parent with canvas-space coordinates for HTML tooltip
      if (city) {
        onCityHover?.({
          canvasX: city.x + MAP_PADDING,
          canvasY: city.y + MAP_PADDING,
          city,
        });
      } else {
        onCityHover?.(null);
      }
    },
    [onCityHover],
  );

  return (
    <Application
      antialias={false}
      backgroundColor={0xfa_fa_f9}
      height={MAP_HEIGHT}
      resolution={window.devicePixelRatio}
      width={MAP_WIDTH}
    >
      <BackgroundGrid />
      {grid ? (
        <>
          <LandGrid grid={grid} />
          <CantonBoundaries grid={grid} />
          <HoverHighlight grid={grid} hoveredCity={hoveredCity} />
          <CityDots grid={grid} onHover={handleHover} />
        </>
      ) : (
        <LoadingText />
      )}
    </Application>
  );
}
