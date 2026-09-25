import { type ReactElement } from "react";
import { JOB_STATUS_SCREEN_READER_LABELS } from "../jobTreeStyle";
import { type JobNode, type JobStatusStyle } from "../types";

interface JobTreeCardProps {
  node: JobNode;
  styles: JobStatusStyle;
}

export function JobTreeCard({ node, styles }: JobTreeCardProps): ReactElement {
  const isCurrent = node.status === "CURRENT";

  return (
    <div
      className={`relative flex min-w-[6.5rem] flex-col items-center gap-0.5 pixel-card px-3 py-2 ${isCurrent ? "pixel-node-glow" : ""}`}
      style={{
        borderColor: styles.border,
        borderStyle: node.status === "LOCKED" ? "dashed" : undefined,
      }}
    >
      {node.status === "COMPLETED" ? (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center font-pixel-small text-[10px] leading-none"
          style={{
            backgroundColor: "var(--text-accent)",
            color: "var(--surface-elevated)",
          }}
        >
          ✓
        </span>
      ) : null}
      <span
        className="font-pixel-small text-[12px] whitespace-nowrap"
        style={{ color: styles.color }}
      >
        {node.fantasy}
      </span>
      <span
        className="font-pixel-small text-[12px] whitespace-nowrap"
        style={{ color: "var(--text-tertiary)" }}
      >
        {node.real}
      </span>
      <span className="sr-only">
        상태: {JOB_STATUS_SCREEN_READER_LABELS[node.status]}
      </span>
      {isCurrent ? (
        <span
          aria-hidden="true"
          className="font-pixel text-[8px]"
          style={{ color: "var(--text-brand)" }}
        >
          ▶ NOW
        </span>
      ) : null}
      {node.status === "LOCKED" ? (
        <span
          aria-hidden="true"
          className="font-pixel text-[8px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          🔒
        </span>
      ) : null}
    </div>
  );
}
