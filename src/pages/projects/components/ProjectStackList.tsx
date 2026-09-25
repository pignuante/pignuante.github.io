import { type ReactElement } from "react";
import { type ProjectSlug } from "../types";

type ProjectStackListVariant = "card" | "detail";

interface ProjectStackListProps {
  slug: ProjectSlug;
  stack: readonly string[];
  variant?: ProjectStackListVariant;
}

const STACK_LIST_VARIANTS: Record<
  ProjectStackListVariant,
  {
    itemClassName: string;
    listClassName: string;
  }
> = {
  card: {
    itemClassName:
      "rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 font-pixel-small text-[12px]",
    listClassName: "mt-4 flex flex-wrap gap-2",
  },
  detail: {
    itemClassName:
      "rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-2 py-1 font-pixel-small text-[12px]",
    listClassName: "mt-4 flex flex-wrap gap-2",
  },
};

export function ProjectStackList({
  slug,
  stack,
  variant = "card",
}: ProjectStackListProps): ReactElement {
  const { itemClassName, listClassName } = STACK_LIST_VARIANTS[variant];

  return (
    <ul className={listClassName} role="list">
      {stack.map((tech) => (
        <li
          className={itemClassName}
          key={`${slug}-${tech}`}
          style={{ color: "var(--text-tertiary)" }}
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}
