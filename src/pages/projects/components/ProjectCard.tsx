import { type ReactElement } from "react";
import { Link } from "react-router";
import PixelDialogHeader from "../../../components/ui/PixelDialogHeader";
import SparkDivider from "../../../components/ui/SparkDivider";
import { type ProjectSummary } from "../types";
import { ProjectLinkActions } from "./ProjectLinkActions";
import { ProjectStackList } from "./ProjectStackList";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProjectThumbnailSlot } from "./ProjectThumbnailSlot";

interface ProjectCardProps {
  project: ProjectSummary;
}

interface ProjectCardFrameProps {
  variant: "hero" | "standard";
  questLabel: string;
  project: ProjectSummary;
}

function ProjectCardFrame({
  project,
  questLabel,
  variant,
}: ProjectCardFrameProps): ReactElement {
  const detailPath = `/projects/${project.slug}`;
  const headingId = `${project.slug}-title`;
  const isHeroVariant = variant === "hero";

  return (
    <article
      aria-labelledby={headingId}
      className={`flex h-full flex-col pixel-card p-5 sm:p-6 ${isHeroVariant ? "md:p-7" : ""}`}
    >
      <PixelDialogHeader label={project.subtitle} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p
          className="inline-flex rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 font-pixel-small text-[12px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {questLabel}
        </p>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-4">
        <ProjectThumbnailSlot
          thumbnail={project.thumbnail}
          variant={isHeroVariant ? "hero" : "card"}
        />
      </div>

      <h3 className="mt-3 font-pixel text-[16px]" id={headingId}>
        <span aria-hidden="true">✦ </span>
        {project.title}
      </h3>
      <p
        className="mt-2 font-pixel-small text-[12px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {project.period} · {project.role}
      </p>
      <p
        className="mt-3 font-pixel-body text-[15px] leading-[1.7]"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.summary}
      </p>

      <ProjectStackList
        slug={project.slug}
        stack={project.stack}
        variant="card"
      />

      <div className="mt-auto">
        <SparkDivider className="my-4" />

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            aria-label={`${project.title} 상세 보기`}
            className="pixel-btn w-full text-center text-xs text-[var(--text-primary)] transition-transform duration-150 hover:-translate-y-0.5 sm:w-auto"
            to={detailPath}
          >
            <span aria-hidden="true">▷ </span>
            상세 보기
          </Link>
          <ProjectLinkActions
            ariaLabel={`${project.title} 외부 링크`}
            links={project.links}
          />
        </div>
      </div>
    </article>
  );
}

export function MainQuestProjectCard({
  project,
}: ProjectCardProps): ReactElement {
  return (
    <ProjectCardFrame
      project={project}
      questLabel="MAIN QUEST"
      variant="standard"
    />
  );
}

export function MainQuestHeroCard({ project }: ProjectCardProps): ReactElement {
  return (
    <ProjectCardFrame
      project={project}
      questLabel="MAIN QUEST HERO"
      variant="hero"
    />
  );
}

export function SideQuestProjectCard({
  project,
}: ProjectCardProps): ReactElement {
  return (
    <ProjectCardFrame
      project={project}
      questLabel="SIDE QUEST"
      variant="standard"
    />
  );
}
