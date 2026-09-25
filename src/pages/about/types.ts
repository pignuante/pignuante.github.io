import { type Variants } from "motion/react";
import { type ReactNode } from "react";

export type EquipmentCategory = "ARMOR" | "TOOL" | "WEAPON";
export type JobColorScheme = "accent" | "brand";
export type JobIcon = "shield" | "wand";
export type JobStatus = "COMPLETED" | "CURRENT" | "LOCKED";
export type QuestStatus = "COMPLETED" | "IN PROGRESS";

export interface CharacterInfo {
  className: string;
  level: number;
  name: string;
  race: string;
  realm: string;
  subClassName: string;
  title: string;
}

export interface CharacterStat {
  id: string;
  label: string;
  value: number | string;
}

export interface EquipmentSlot {
  category: EquipmentCategory;
  id: string;
  label: string;
  stars: number;
}

export interface InventoryItem {
  id: string;
  label: string;
}

export interface JobBranch {
  colorScheme: JobColorScheme;
  icon: JobIcon;
  id: string;
  label: string;
  nodes: JobNode[];
}

export interface JobNode {
  fantasy: string;
  id: string;
  real: string;
  status: JobStatus;
}

export interface JobStatusStyle {
  border: string;
  color: string;
  /** Connector colour leading into a node with this status */
  line: string;
  opacity: number;
}

export interface JobTreeNodeViewModel {
  node: JobNode;
  styles: JobStatusStyle;
}

export interface JobTreeBranchViewModel {
  branch: JobBranch;
  /** Nodes with status COMPLETED */
  completed: number;
  isBrand: boolean;
  nodes: readonly JobTreeNodeViewModel[];
}

export interface JobTreeViewModel {
  branches: readonly JobTreeBranchViewModel[];
  trunk: JobTreeNodeViewModel;
}

export interface QuestEntry {
  description: string;
  id: string;
  period: string;
  status: QuestStatus;
  title: string;
}

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

export interface SkillCategoryInfo {
  icon: string;
  key: EquipmentCategory;
}

export type SkillsByCategory = Record<EquipmentCategory, EquipmentSlot[]>;
