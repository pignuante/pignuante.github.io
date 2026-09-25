import { type ReactElement } from "react";
import { type JobTreeBranchViewModel } from "../types";
import { JobPixelIcon } from "./JobPixelIcon";

/** Branch name with its pixel icon, completed count and a small XP bar. */
export function JobBranchHeader({
  branchView,
}: {
  branchView: JobTreeBranchViewModel;
}): ReactElement {
  const { branch, completed, isBrand, nodes } = branchView;
  const color = isBrand ? "var(--text-brand)" : "var(--text-accent)";
  const barColor = isBrand
    ? "var(--color-brand-400)"
    : "var(--color-accent-400)";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <JobPixelIcon icon={branch.icon} />
        <span className="font-pixel-small text-[12px]" style={{ color }}>
          {branch.label}
        </span>
        <span
          className="font-pixel-small text-[12px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span className="sr-only">완료 </span>
          {completed}/{nodes.length}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="h-[5px] w-full max-w-[8rem] border"
        style={{ borderColor: barColor }}
      >
        <div
          className="h-full"
          style={{
            backgroundColor: barColor,
            width: `${(completed / nodes.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
