import { type ReactElement } from "react";
import { type JobIcon } from "../types";

/** 8x8 sprites; "." is transparent */
const SPRITES: Readonly<Record<JobIcon, readonly string[]>> = {
  shield: [
    ".KKKKKK.",
    "KaaaaaaK",
    "KaWaaaaK",
    "KaaaaaaK",
    "KaaaaAaK",
    ".KaaAaK.",
    "..KaaK..",
    "...KK...",
  ],
  wand: [
    "......Y.",
    ".....YWY",
    "......Y.",
    ".....B..",
    "....B...",
    "...B....",
    "..B.....",
    ".B......",
  ],
};

const COLORS: Readonly<Record<string, string>> = {
  A: "var(--color-accent-600)",
  a: "var(--color-accent-400)",
  B: "var(--color-brand-700)",
  K: "var(--color-neutral-800)",
  W: "var(--surface-elevated)",
  Y: "var(--color-warning)",
};

export function JobPixelIcon({ icon }: { icon: JobIcon }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0"
      shapeRendering="crispEdges"
      viewBox="0 0 8 8"
    >
      {SPRITES[icon].flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "." ? null : (
            <rect
              fill={COLORS[cell]}
              height={1}
              key={`${x}-${y}`}
              width={1}
              x={x}
              y={y}
            />
          ),
        ),
      )}
    </svg>
  );
}
