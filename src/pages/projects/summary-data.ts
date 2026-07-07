import {
  type ProjectQuestTier,
  type ProjectSlug,
  type ProjectStatus,
  type ProjectSummary,
} from "./types";

const PROJECT_STATUS_LABELS: Readonly<Record<ProjectStatus, string>> = {
  ARCHIVED: "파일럿 종료",
  COMPLETED: "검증 완료",
  IN_PROGRESS: "프로토타입",
  LIVE: "운영 중",
};

export const PROJECT_SUMMARIES: readonly ProjectSummary[] = [
  {
    links: {
      demoUrl: "https://example.com/pixel-kingdom",
      repoUrl: "https://github.com/pignuante/pixel-kingdom",
    },
    period: "2025.11 - 2026.01",
    questTier: "MAIN",
    role: "기획 · 프론트엔드 · 배포",
    slug: "pixel-kingdom-portal",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS v4"],
    status: "LIVE",
    subtitle: "왕국 포털 리빌드",
    summary:
      "PignuAnte 포트폴리오를 RPG 스타일로 재구성한 핵심 리빌드 프로젝트",
    thumbnail: {
      alt: "픽셀 킹덤 포털의 카드형 대시보드 화면",
      caption: "Portal UI",
    },
    title: "픽셀 킹덤 포털",
  },
  {
    links: {
      repoUrl: "https://github.com/pignuante/dungeon-party-planner",
    },
    period: "2025.06 - 2025.08",
    questTier: "MAIN",
    role: "백엔드 · 데이터 모델링",
    slug: "dungeon-party-planner",
    stack: ["Node.js", "PostgreSQL", "Prisma", "Redis"],
    status: "COMPLETED",
    subtitle: "레이드 운영 자동화",
    summary: "파티 일정 충돌을 줄이기 위한 레이드 플래너 백엔드 구축",
    thumbnail: {
      alt: "던전 파티 플래너의 레이드 일정 보드 화면",
      caption: "Raid Board",
    },
    title: "던전 파티 플래너",
  },
  {
    links: {
      demoUrl: "https://example.com/route-quest-board",
    },
    period: "2025.03 - 2025.05",
    questTier: "SIDE",
    role: "프론트엔드 · UX 설계",
    slug: "route-quest-board",
    stack: ["React", "TypeScript", "React Router", "Zustand"],
    status: "IN_PROGRESS",
    subtitle: "이동 루틴 시각화",
    summary: "일상 이동 데이터를 퀘스트 카드로 정리하는 프론트엔드 실험",
    thumbnail: {
      alt: "루트 퀘스트 보드의 이동 카드 목록 화면",
      caption: "Route Cards",
    },
    title: "루트 퀘스트 보드",
  },
  {
    links: {},
    period: "2024.11 - 2025.01",
    questTier: "SIDE",
    role: "기획 · 풀스택 개발",
    slug: "campfire-retrospective-log",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    status: "ARCHIVED",
    subtitle: "팀 회고 로그 시스템",
    summary: "결정 기록을 재사용하기 위한 회고 아카이브 도구",
    thumbnail: {
      alt: "캠프파이어 로그의 회고 아카이브 화면",
      caption: "Retrospective Log",
    },
    title: "캠프파이어 로그",
  },
];

const PROJECT_SUMMARIES_BY_SLUG = new Map<ProjectSlug, ProjectSummary>(
  PROJECT_SUMMARIES.map((projectSummary) => [
    projectSummary.slug,
    projectSummary,
  ]),
);

const PROJECT_SUMMARIES_BY_TIER: Readonly<
  Record<ProjectQuestTier, readonly ProjectSummary[]>
> = {
  MAIN: PROJECT_SUMMARIES.filter(
    (projectSummary) => projectSummary.questTier === "MAIN",
  ),
  SIDE: PROJECT_SUMMARIES.filter(
    (projectSummary) => projectSummary.questTier === "SIDE",
  ),
};

export const MAIN_QUEST_SUMMARIES = PROJECT_SUMMARIES_BY_TIER.MAIN;

export const MAIN_QUEST_HERO_SUMMARY =
  MAIN_QUEST_SUMMARIES.find(
    (projectSummary) => projectSummary.status === "LIVE",
  ) ?? MAIN_QUEST_SUMMARIES[0];

export const SIDE_QUEST_SUMMARIES = PROJECT_SUMMARIES_BY_TIER.SIDE;

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}

export function getProjectSummaryBySlug(
  slug: ProjectSlug,
): ProjectSummary | undefined {
  return PROJECT_SUMMARIES_BY_SLUG.get(slug);
}
