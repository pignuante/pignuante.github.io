import { type CSSProperties } from "react";
import { type JobNode, type JobStatus } from "./types";

export const JOB_STATUS_SCREEN_READER_LABELS: Readonly<
  Record<JobNode["status"], string>
> = {
  COMPLETED: "완료",
  CURRENT: "현재 진행 중",
  LOCKED: "잠김",
};

/** Background for a 3px connector: solid, or dashed toward a locked node. */
export function connectorStyle(
  color: string,
  status: JobStatus,
  axis: "x" | "y" = "x",
): CSSProperties {
  if (status !== "LOCKED") return { backgroundColor: color };
  const direction = axis === "x" ? "90deg" : "180deg";
  return {
    backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0 6px, transparent 6px 10px)`,
  };
}
