import { type ReactElement } from "react";
import { type JobTreeViewModel } from "../types";
import { JobTreeCard } from "./JobTreeCard";

interface JobTreeMobileProps {
  viewModel: JobTreeViewModel;
}

export function JobTreeMobile({ viewModel }: JobTreeMobileProps): ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 md:hidden">
      <JobTreeCard
        node={viewModel.trunk.node}
        styles={viewModel.trunk.styles}
      />
      <div
        className="h-4 w-[3px]"
        style={{ backgroundColor: "var(--color-brand-200)" }}
      />
      <div className="flex flex-col gap-4">
        {viewModel.branches.map((branchView, branchIndex) => (
          <div
            className="flex flex-col items-center gap-2"
            key={branchView.branch.id}
          >
            {branchIndex > 0 ? (
              <div
                className="mb-1 h-4 w-[3px]"
                style={{ backgroundColor: "var(--color-accent-200)" }}
              />
            ) : null}
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">
                {branchView.branch.icon}
              </span>
              <span
                className="font-pixel-small text-[12px]"
                style={{
                  color: branchView.isBrand
                    ? "var(--text-brand)"
                    : "var(--text-accent)",
                }}
              >
                {branchView.branch.label}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              {branchView.nodes.map((nodeView, nodeIndex) => (
                <div
                  className="flex flex-col items-center"
                  key={nodeView.node.id}
                >
                  {nodeIndex > 0 ? (
                    <span
                      aria-hidden="true"
                      className="font-pixel text-[10px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      ↓
                    </span>
                  ) : null}
                  <JobTreeCard node={nodeView.node} styles={nodeView.styles} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
