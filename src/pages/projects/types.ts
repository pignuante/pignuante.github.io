import { type PixelSceneId } from "./pixelScenes";

export interface ProjectLinks {
  demoUrl?: string;
  docsUrl?: string;
  repoUrl?: string;
}

export interface ProjectHighlight {
  description?: string;
  id: string;
  label: string;
  value: string;
}

export interface ProjectMetaBadge {
  label: string;
  value: string;
}

export interface ProjectThumbnail {
  alt: string;
  caption: string;
  /** Pixel-art scene drawn when there is no `src` image */
  scene?: PixelSceneId;
  src?: string;
}

export const PROJECT_SLUGS = [
  "campfire-retrospective-log",
  "dungeon-party-planner",
  "pixel-kingdom-portal",
  "route-quest-board",
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

export function isProjectSlug(value: string): value is ProjectSlug {
  return (PROJECT_SLUGS as readonly string[]).includes(value);
}

export type ProjectSectionId = "overview" | "problem" | "solution" | "result";

export interface ProjectSection {
  body: string;
  heading: string;
  id: ProjectSectionId;
}

export type ProjectStatus = "LIVE" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type ProjectQuestTier = "MAIN" | "SIDE";

export interface ProjectSummary {
  links: ProjectLinks;
  period: string;
  questTier: ProjectQuestTier;
  role: string;
  slug: ProjectSlug;
  stack: readonly string[];
  status: ProjectStatus;
  subtitle: string;
  summary: string;
  thumbnail: ProjectThumbnail;
  title: string;
}

export interface Project extends ProjectSummary {
  highlights: readonly ProjectHighlight[];
  sections: readonly ProjectSection[];
}

/** view-transition-name for a project's thumbnail, shared by card and detail */
export function projectThumbnailTransitionName(slug: ProjectSlug): string {
  return `project-thumb-${slug}`;
}
