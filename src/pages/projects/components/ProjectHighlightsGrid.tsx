import { type ReactElement } from "react";
import { type ProjectHighlight, type ProjectSlug } from "../types";

interface ProjectHighlightsGridProps {
  highlights: readonly ProjectHighlight[];
  slug: ProjectSlug;
}

export function ProjectHighlightsGrid({
  highlights,
  slug,
}: ProjectHighlightsGridProps): ReactElement | null {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
      {highlights.map((highlight) => (
        <div className="pixel-card p-4" key={`${slug}-${highlight.id}`}>
          <dt
            className="font-pixel-small text-[12px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {highlight.label}
          </dt>
          <dd
            className="mt-1 font-pixel text-[24px]"
            style={{ color: "var(--text-brand)" }}
          >
            {highlight.value}
          </dd>
          {highlight.description ? (
            <p
              className="mt-2 font-pixel-small text-[12px] leading-[1.6]"
              style={{ color: "var(--text-secondary)" }}
            >
              {highlight.description}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
