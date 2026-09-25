import { type ReactElement } from "react";
import { JOB_BRANCHES, JOB_STATUS_STYLES, JOB_TRUNK } from "../data";
import {
  type JobBranch,
  type JobNode,
  type JobStatus,
  type JobStatusStyle,
  type JobTreeBranchViewModel,
  type JobTreeNodeViewModel,
  type JobTreeViewModel,
} from "../types";
import { JobTreeDesktop } from "./JobTreeDesktop";
import { JobTreeMobile } from "./JobTreeMobile";

export function JobTree(): ReactElement {
  const viewModel = createJobTreeViewModel(
    JOB_BRANCHES,
    JOB_STATUS_STYLES,
    JOB_TRUNK,
  );

  return (
    <>
      <h3
        className="mb-4 font-pixel text-[16px]"
        style={{ color: "var(--text-secondary)" }}
      >
        <span aria-hidden="true">⚡ </span>
        JOB TREE
      </h3>
      <JobTreeMobile viewModel={viewModel} />
      <JobTreeDesktop viewModel={viewModel} />
    </>
  );
}

function createJobTreeViewModel(
  branches: readonly JobBranch[],
  statusStyles: Readonly<Record<JobStatus, JobStatusStyle>>,
  trunk: JobNode,
): JobTreeViewModel {
  return {
    branches: branches.map((branch) =>
      createJobTreeBranchViewModel(branch, statusStyles),
    ),
    trunk: createJobTreeNodeViewModel(statusStyles, trunk),
  };
}

function createJobTreeBranchViewModel(
  branch: JobBranch,
  statusStyles: Readonly<Record<JobStatus, JobStatusStyle>>,
): JobTreeBranchViewModel {
  return {
    branch,
    isBrand: branch.colorScheme === "brand",
    nodes: branch.nodes.map((node) =>
      createJobTreeNodeViewModel(statusStyles, node),
    ),
  };
}

function createJobTreeNodeViewModel(
  statusStyles: Readonly<Record<JobStatus, JobStatusStyle>>,
  node: JobNode,
): JobTreeNodeViewModel {
  return {
    node,
    styles: statusStyles[node.status],
  };
}
