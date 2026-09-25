import { type ReactElement } from "react";
import { type ProjectMetaBadge } from "../types";

interface ProjectMetaBadgeStripProps {
  badges: readonly ProjectMetaBadge[];
}

export function ProjectMetaBadgeStrip({
  badges,
}: ProjectMetaBadgeStripProps): ReactElement | null {
  if (badges.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-2" role="list">
      {badges.map((badge) => (
        <li
          className="rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1"
          key={`${badge.label}-${badge.value}`}
        >
          <span
            className="font-pixel-small text-[12px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {badge.label}
          </span>
          <span
            className="ml-1 font-pixel-small text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {badge.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
