import { type ReactElement } from "react";
import { Link, useParams } from "react-router";
import PixelDialogHeader from "../components/ui/PixelDialogHeader";
import SparkDivider from "../components/ui/SparkDivider";
import { ProjectDetailSection } from "./projects/components/ProjectDetailSection";
import { ProjectHighlightsGrid } from "./projects/components/ProjectHighlightsGrid";
import { ProjectLinkActions } from "./projects/components/ProjectLinkActions";
import { ProjectMetaBadgeStrip } from "./projects/components/ProjectMetaBadgeStrip";
import { ProjectStackList } from "./projects/components/ProjectStackList";
import { ProjectStatusBadge } from "./projects/components/ProjectStatusBadge";
import { ProjectThumbnailSlot } from "./projects/components/ProjectThumbnailSlot";
import { getProjectBySlug } from "./projects/detail-data";
import {
  isProjectSlug,
  projectThumbnailTransitionName,
  type ProjectMetaBadge,
} from "./projects/types";

export default function ProjectDetail(): ReactElement {
  const { slug } = useParams();
  const project =
    slug && isProjectSlug(slug) ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return (
      <section
        aria-labelledby="project-detail-not-found-title"
        className="mx-auto max-w-5xl pixel-dot-bg px-6 py-24"
      >
        <div className="max-w-2xl pixel-dialog p-6">
          <h1
            className="font-pixel text-[16px]"
            id="project-detail-not-found-title"
          >
            <span aria-hidden="true">! </span>
            프로젝트를 찾지 못했습니다
          </h1>
          <p
            className="mt-3 font-pixel-body text-[15px]"
            style={{ color: "var(--text-secondary)" }}
          >
            요청한 퀘스트 기록이 존재하지 않습니다. 목록으로 돌아가 다른 기록을
            확인해 주세요.
          </p>
          <Link
            className="mt-4 pixel-btn inline-flex text-xs text-[var(--text-primary)]"
            to="/projects"
            viewTransition
          >
            <span aria-hidden="true">← </span>
            프로젝트 목록으로 이동
          </Link>
        </div>
      </section>
    );
  }

  const metaBadges: readonly ProjectMetaBadge[] = [
    {
      label: "기간",
      value: project.period,
    },
    {
      label: "역할",
      value: project.role,
    },
  ];

  return (
    <section
      aria-labelledby="project-detail-title"
      className="mx-auto max-w-5xl pixel-dot-bg px-6 py-24"
    >
      <header>
        <Link
          className="inline-flex font-pixel-small text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          to="/projects"
          viewTransition
        >
          <span aria-hidden="true">← </span>
          프로젝트 목록으로
        </Link>

        <div className="mt-4">
          <ProjectThumbnailSlot
            thumbnail={project.thumbnail}
            transitionName={projectThumbnailTransitionName(project.slug)}
            variant="hero"
          />
        </div>

        <PixelDialogHeader className="mt-4" label={project.subtitle} />

        <h1
          className="mt-3 pixel-glow-pulse font-pixel text-[24px]"
          id="project-detail-title"
        >
          <span aria-hidden="true">✦ </span>
          {project.title}
        </h1>
        <p
          className="mt-3 font-pixel-body text-[15px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {project.summary}
        </p>

        <div className="mt-3">
          <ProjectStatusBadge status={project.status} />
        </div>

        <ProjectMetaBadgeStrip badges={metaBadges} />
      </header>

      <SparkDivider className="mt-6" />

      <section aria-labelledby="project-detail-links-heading" className="mt-6">
        <h2 className="sr-only" id="project-detail-links-heading">
          {project.title} 외부 링크
        </h2>
        <ProjectLinkActions
          ariaLabelledBy="project-detail-links-heading"
          links={project.links}
        />
      </section>

      <section aria-labelledby="project-detail-stack-heading" className="mt-8">
        <h2
          className="font-pixel text-[16px]"
          id="project-detail-stack-heading"
        >
          <span aria-hidden="true">▶ </span>
          사용 기술
        </h2>
        <ProjectStackList
          slug={project.slug}
          stack={project.stack}
          variant="detail"
        />
      </section>

      <section
        aria-labelledby="project-detail-highlights-heading"
        className="mt-8"
      >
        <h2
          className="font-pixel text-[16px]"
          id="project-detail-highlights-heading"
        >
          <span aria-hidden="true">♦ </span>
          전리품/성과
        </h2>
        <ProjectHighlightsGrid
          highlights={project.highlights}
          slug={project.slug}
        />
      </section>

      <div className="mt-8 grid gap-4">
        {project.sections.map((section) => (
          <ProjectDetailSection
            body={section.body}
            heading={section.heading}
            headingId={`project-detail-${project.slug}-${section.id}-heading`}
            key={`${project.slug}-${section.id}`}
          />
        ))}
      </div>
    </section>
  );
}
