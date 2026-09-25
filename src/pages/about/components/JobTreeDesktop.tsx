import { type ReactElement, useRef } from "react";
import { useOverflowX } from "../../../hooks/useOverflowX";
import { connectorStyle } from "../jobTreeStyle";
import { type JobTreeBranchViewModel, type JobTreeViewModel } from "../types";
import { JobTreeCard } from "./JobTreeCard";
import { JobBranchHeader } from "./JobTreeParts";

interface JobTreeDesktopProps {
  viewModel: JobTreeViewModel;
}

/** Half of the grid's row gap: elbow lines reach across it to join. */
const ROW_GAP_HALF = "-0.375rem";

export function JobTreeDesktop({
  viewModel,
}: JobTreeDesktopProps): ReactElement {
  const { branches, trunk } = viewModel;
  const lastBranch = branches.length - 1;

  return (
    <div
      className="hidden items-center gap-y-3 pb-2 lg:grid"
      style={{
        gridTemplateColumns: "auto 1.5rem 8rem minmax(0, 1fr)",
        gridTemplateRows: `repeat(${branches.length}, auto)`,
      }}
    >
      <div
        className="flex items-center"
        style={{ gridColumn: "1", gridRow: `1 / ${branches.length + 1}` }}
      >
        <JobTreeCard node={trunk.node} styles={trunk.styles} />
        <span
          aria-hidden="true"
          className="h-[3px] w-3"
          style={{ backgroundColor: trunk.styles.line }}
        />
      </div>
      {branches.map((branchView, branchIndex) => (
        <div className="contents" key={branchView.branch.id}>
          {/* Elbow: trunk stub -> vertical spine -> this branch */}
          <div
            aria-hidden="true"
            className="relative self-stretch"
            style={{ gridColumn: "2", gridRow: `${branchIndex + 1}` }}
          >
            {branches.length > 1 ? (
              <span
                className="absolute left-0 w-[3px]"
                style={{
                  backgroundColor: trunk.styles.line,
                  bottom: branchIndex === lastBranch ? "50%" : ROW_GAP_HALF,
                  top: branchIndex === 0 ? "50%" : ROW_GAP_HALF,
                }}
              />
            ) : null}
            <span
              className="absolute top-1/2 right-2 left-0 h-[3px] -translate-y-1/2"
              style={{ backgroundColor: trunk.styles.line }}
            />
          </div>
          <div style={{ gridColumn: "3", gridRow: `${branchIndex + 1}` }}>
            <JobBranchHeader branchView={branchView} />
          </div>
          <JobBranchRow branchView={branchView} gridRow={branchIndex + 1} />
        </div>
      ))}
    </div>
  );
}

/**
 * One branch's nodes. A row wider than the box scrolls here rather than the
 * page; only then is it a named, focusable region, so a keyboard can scroll
 * it (Safari does not focus scrollers on its own) without adding a dead tab
 * stop when everything fits.
 */
function JobBranchRow({
  branchView,
  gridRow,
}: {
  branchView: JobTreeBranchViewModel;
  gridRow: number;
}): ReactElement {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const overflows = useOverflowX(scrollerRef);

  return (
    <div
      aria-label={overflows ? `${branchView.branch.label} 경로` : undefined}
      className="flex overflow-x-auto py-3"
      ref={scrollerRef}
      role={overflows ? "region" : undefined}
      style={{ gridColumn: "4", gridRow: `${gridRow}` }}
      tabIndex={overflows ? 0 : undefined}
    >
      <ol className="flex items-center">
        {branchView.nodes.map((nodeView, nodeIndex) => (
          <li className="flex items-center" key={nodeView.node.id}>
            <span
              aria-hidden="true"
              className={`h-[3px] ${nodeIndex === 0 ? "w-3" : "w-5"}`}
              style={connectorStyle(nodeView.styles.line, nodeView.node.status)}
            />
            <JobTreeCard node={nodeView.node} styles={nodeView.styles} />
          </li>
        ))}
      </ol>
      {/* End room for the last card's shadow: WebKit can leave a flex
          scroller's end padding out of the scroll area. */}
      <span aria-hidden="true" className="w-3 flex-shrink-0" />
    </div>
  );
}
