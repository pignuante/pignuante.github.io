import { type ReactElement } from "react";
import {
  connectorStyle,
  JOB_STATUS_SCREEN_READER_LABELS,
} from "../jobTreeStyle";
import { type JobTreeViewModel } from "../types";
import { JobTreeCard } from "./JobTreeCard";
import { JobBranchHeader } from "./JobTreeParts";

interface JobTreeMobileProps {
  viewModel: JobTreeViewModel;
}

/**
 * A compact rail: the trunk on top, each branch as a short checklist. Used
 * below lg, where the five-node desktop row (about 880px) does not fit.
 */
export function JobTreeMobile({ viewModel }: JobTreeMobileProps): ReactElement {
  const { branches, trunk } = viewModel;

  return (
    <div className="max-w-md lg:hidden">
      <div className="inline-flex">
        <JobTreeCard node={trunk.node} styles={trunk.styles} />
      </div>
      <ol className="ml-4">
        {branches.map((branchView, branchIndex) => {
          const isLast = branchIndex === branches.length - 1;
          return (
            <li className="relative pt-3 pl-6" key={branchView.branch.id}>
              {/* Spine down from the trunk; the last branch stops at its stub */}
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 w-[3px]"
                style={{
                  backgroundColor: trunk.styles.line,
                  bottom: isLast ? undefined : 0,
                  height: isLast ? "1.375rem" : undefined,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-5 left-0 h-[3px] w-4"
                style={{ backgroundColor: trunk.styles.line }}
              />
              <JobBranchHeader branchView={branchView} />
              <ol className="mt-2 flex flex-col">
                {branchView.nodes.map((nodeView, nodeIndex) => {
                  const { node, styles } = nodeView;
                  return (
                    <li
                      className="relative flex items-center gap-2 py-1 pl-5"
                      key={node.id}
                      style={{ opacity: styles.opacity }}
                    >
                      {nodeIndex > 0 ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-0 left-[3px] h-1/2 w-[3px]"
                          style={connectorStyle(styles.line, node.status, "y")}
                        />
                      ) : null}
                      {nodeIndex < branchView.nodes.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 left-[3px] h-1/2 w-[3px]"
                          style={connectorStyle(
                            branchView.nodes[nodeIndex + 1].styles.line,
                            branchView.nodes[nodeIndex + 1].node.status,
                            "y",
                          )}
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 left-0 h-[9px] w-[9px] -translate-y-1/2 border-2 ${node.status === "CURRENT" ? "pixel-marker-glow" : ""}`}
                        style={{
                          backgroundColor:
                            node.status === "LOCKED"
                              ? "var(--surface-elevated)"
                              : styles.line,
                          borderColor: styles.line,
                          borderStyle:
                            node.status === "LOCKED" ? "dashed" : "solid",
                        }}
                      />
                      <span
                        className="font-pixel-small text-[12px]"
                        style={{ color: styles.color }}
                      >
                        {node.fantasy}
                      </span>
                      {node.status === "CURRENT" ? (
                        <span
                          aria-hidden="true"
                          className="font-pixel text-[8px]"
                          style={{ color: "var(--text-brand)" }}
                        >
                          ▶ NOW
                        </span>
                      ) : null}
                      <span
                        className="ml-auto font-pixel-small text-[12px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {node.real}
                        {node.status === "LOCKED" ? (
                          <span aria-hidden="true"> 🔒</span>
                        ) : null}
                      </span>
                      <span className="sr-only">
                        상태: {JOB_STATUS_SCREEN_READER_LABELS[node.status]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
