import { type ReactElement } from "react";
import SparkDivider from "../components/ui/SparkDivider";
import {
  MainQuestHeroCard,
  MainQuestProjectCard,
  SideQuestProjectCard,
} from "./projects/components/ProjectCard";
import {
  MAIN_QUEST_HERO_SUMMARY,
  MAIN_QUEST_SUMMARIES,
  SIDE_QUEST_SUMMARIES,
} from "./projects/summary-data";

export default function Projects(): ReactElement {
  const regularMainQuestSummaries = MAIN_QUEST_SUMMARIES.filter(
    (projectSummary) => projectSummary.slug !== MAIN_QUEST_HERO_SUMMARY?.slug,
  );

  return (
    <section
      aria-labelledby="projects-page-title"
      className="mx-auto max-w-5xl pixel-dot-bg px-6 py-24"
    >
      <header>
        <h1
          className="pixel-glow-pulse font-pixel text-base sm:text-lg md:text-2xl"
          id="projects-page-title"
          style={{ color: "var(--text-brand)" }}
        >
          <span aria-hidden="true">✦ </span>
          QUEST LOG
        </h1>
        <p
          className="mt-3 font-pixel-body text-sm sm:text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          모험가가 완수한 퀘스트와 진행 중인 임무 기록
        </p>
      </header>

      <SparkDivider className="mt-6" />

      <section aria-labelledby="projects-main-quest-title" className="mt-10">
        <h2
          className="font-pixel text-sm sm:text-base"
          id="projects-main-quest-title"
        >
          <span aria-hidden="true">★ </span>
          Main Quest
        </h2>
        <p
          className="mt-3 font-pixel-body text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          길드 게시판에 등록된 공식 의뢰 임무
        </p>

        {MAIN_QUEST_HERO_SUMMARY ? (
          <div className="mt-4">
            <MainQuestHeroCard project={MAIN_QUEST_HERO_SUMMARY} />
          </div>
        ) : null}

        {regularMainQuestSummaries.length > 0 ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2" role="list">
            {regularMainQuestSummaries.map((project) => (
              <li className="h-full" key={project.slug}>
                <MainQuestProjectCard project={project} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="projects-side-quest-title" className="mt-10">
        <h2
          className="font-pixel text-sm sm:text-base"
          id="projects-side-quest-title"
        >
          <span aria-hidden="true">◆ </span>
          Side Quests
        </h2>
        <p
          className="mt-3 font-pixel-body text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          모험가가 홀로 떠난 자유 탐험 기록
        </p>
        <ul className="mt-4 grid gap-4 md:grid-cols-2" role="list">
          {SIDE_QUEST_SUMMARIES.map((project) => (
            <li className="h-full" key={project.slug}>
              <SideQuestProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
