import { type ReactElement } from "react";
import { getProjectStatusLabel } from "../summary-data";
import { type ProjectStatus } from "../types";

interface ProjectStatusBadgeProps {
  className?: string;
  status: ProjectStatus;
}

const STATUS_STYLE_MAP: Record<
  ProjectStatus,
  {
    backgroundColor: string;
    borderColor: string;
    icon: string;
    textColor: string;
  }
> = {
  ARCHIVED: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-default)",
    icon: "[A]",
    textColor: "var(--text-tertiary)",
  },
  COMPLETED: {
    backgroundColor: "var(--surface-elevated)",
    borderColor: "var(--color-brand-200)",
    icon: "[C]",
    textColor: "var(--text-primary)",
  },
  IN_PROGRESS: {
    backgroundColor: "var(--color-accent-100)",
    borderColor: "var(--color-accent-300)",
    icon: "[P]",
    textColor: "var(--text-accent)",
  },
  LIVE: {
    backgroundColor: "var(--color-brand-100)",
    borderColor: "var(--color-brand-300)",
    icon: "[L]",
    textColor: "var(--text-brand)",
  },
};

export function ProjectStatusBadge({
  className,
  status,
}: ProjectStatusBadgeProps): ReactElement {
  const statusStyle = STATUS_STYLE_MAP[status];

  return (
    <p
      className={`inline-flex items-center gap-1 rounded-[var(--pixel-border-radius)] border px-2 py-1 font-pixel-small text-[12px] ${className ?? ""}`}
      style={{
        backgroundColor: statusStyle.backgroundColor,
        borderColor: statusStyle.borderColor,
        color: statusStyle.textColor,
      }}
    >
      <span aria-hidden="true">{statusStyle.icon}</span>
      {getProjectStatusLabel(status)}
    </p>
  );
}
