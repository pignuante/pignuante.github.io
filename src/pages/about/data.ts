import {
  type CharacterInfo,
  type CharacterStat,
  type EquipmentCategory,
  type EquipmentSlot,
  type InventoryItem,
  type JobBranch,
  type JobNode,
  type JobStatus,
  type JobStatusStyle,
  type QuestEntry,
  type SkillCategoryInfo,
  type SkillsByCategory,
} from "./types";

type ReadonlySkillsByCategory = Readonly<
  Record<EquipmentCategory, readonly EquipmentSlot[]>
>;

export const CHARACTER_INFO: Readonly<CharacterInfo> = {
  className: "풀스택 마법사",
  level: 99,
  name: "PignuAnte",
  race: "오리너구리",
  realm: "지능 마법 & 결계술의 최전선",
  subClassName: "마도 연구생",
  title: "코드의 방랑자",
};

export const CHARACTER_BIO: string =
  "PignuAnte 왕국의 주인 PignuAnte입니다.\n코드라는 마법을 다루며, 새로운 던전(프로젝트)을 탐험하고\n버그라는 몬스터를 처치하는 것이 일상입니다.\n가끔은 월드맵(세계 여행)을 떠나기도 합니다.";

export const CHARACTER_STATS: readonly CharacterStat[] = [
  { id: "race", label: "RACE", value: CHARACTER_INFO.race },
  { id: "class", label: "CLASS", value: CHARACTER_INFO.className },
  { id: "sub", label: "SUB", value: CHARACTER_INFO.subClassName },
  { id: "lvl", label: "LVL", value: CHARACTER_INFO.level },
  { id: "title", label: "TITLE", value: CHARACTER_INFO.title },
  { id: "realm", label: "REALM", value: CHARACTER_INFO.realm },
];

export const JOB_TRUNK: JobNode = {
  fantasy: "수련생",
  id: "job-trunk-trainee",
  real: "고등",
  status: "COMPLETED",
};

export const JOB_BRANCHES: readonly JobBranch[] = [
  {
    colorScheme: "brand",
    icon: "🪄",
    id: "branch-mage",
    label: "마법사",
    nodes: [
      {
        fantasy: "마법학 학사",
        id: "mage-bachelor",
        real: "학사",
        status: "COMPLETED",
      },
      {
        fantasy: "상급 마법사",
        id: "mage-master",
        real: "석사",
        status: "COMPLETED",
      },
      {
        fantasy: "풀스택 마법사",
        id: "mage-practical",
        real: "실무",
        status: "COMPLETED",
      },
      {
        fantasy: "마도 연구생",
        id: "mage-doctoral-student",
        real: "박사과정",
        status: "CURRENT",
      },
      {
        fantasy: "아크메이지",
        id: "mage-archmage",
        real: "박사",
        status: "LOCKED",
      },
    ],
  },
  {
    colorScheme: "accent",
    icon: "🛡️",
    id: "branch-warrior",
    label: "전사",
    nodes: [
      {
        fantasy: "정식 전사",
        id: "warrior-bachelor",
        real: "학사",
        status: "COMPLETED",
      },
    ],
  },
];

export const JOB_STATUS_STYLES: Readonly<Record<JobStatus, JobStatusStyle>> = {
  COMPLETED: {
    border: "var(--color-accent-300)",
    color: "var(--color-accent-500)",
    opacity: 1,
  },
  CURRENT: {
    border: "var(--color-brand-400)",
    color: "var(--color-brand-500)",
    opacity: 1,
  },
  LOCKED: {
    border: "var(--border-default)",
    color: "var(--text-tertiary)",
    opacity: 0.5,
  },
};

export const EQUIPPED_SKILLS: readonly EquipmentSlot[] = [
  { category: "WEAPON", id: "skill-typescript", label: "TypeScript", stars: 5 },
  { category: "WEAPON", id: "skill-react", label: "React", stars: 5 },
  { category: "WEAPON", id: "skill-nextjs", label: "Next.js", stars: 4 },
  { category: "ARMOR", id: "skill-nodejs", label: "Node.js", stars: 4 },
  { category: "ARMOR", id: "skill-postgresql", label: "PostgreSQL", stars: 3 },
  { category: "ARMOR", id: "skill-aws", label: "AWS", stars: 3 },
  { category: "TOOL", id: "skill-git", label: "Git", stars: 5 },
  { category: "TOOL", id: "skill-figma", label: "Figma", stars: 3 },
  { category: "TOOL", id: "skill-vite", label: "Vite", stars: 4 },
];

export const INVENTORY_ITEMS: readonly InventoryItem[] = [
  { id: "inventory-docker", label: "Docker" },
  { id: "inventory-tailwind-css", label: "Tailwind CSS" },
  { id: "inventory-python", label: "Python" },
  { id: "inventory-graphql", label: "GraphQL" },
  { id: "inventory-redis", label: "Redis" },
  { id: "inventory-terraform", label: "Terraform" },
];

export const QUEST_ENTRIES: readonly QuestEntry[] = [
  {
    description:
      "PignuAnte 왕국의 포털(포트폴리오 사이트)을 픽셀 마법으로 건설",
    id: "quest-kingdom-portal",
    period: "2024.01 - 현재",
    status: "IN PROGRESS",
    title: "왕국의 포털 건설",
  },
  {
    description: "클라우드 던전에서 서버리스 아키텍처 보스를 처치",
    id: "quest-cloud-dungeon",
    period: "2023.06 - 2023.12",
    status: "COMPLETED",
    title: "클라우드 던전 정복",
  },
  {
    description: "프론트엔드 길드에 입단하여 React 마법을 수련",
    id: "quest-frontend-guild",
    period: "2022.03 - 2023.05",
    status: "COMPLETED",
    title: "프론트엔드 길드 수련",
  },
  {
    description: "코딩이라는 마법을 처음 배우고 모험가의 길에 입문",
    id: "quest-awakening",
    period: "2020.01 - 2022.02",
    status: "COMPLETED",
    title: "모험가의 각성",
  },
];

export const SKILL_CATEGORIES: readonly SkillCategoryInfo[] = [
  { icon: "⚔️", key: "WEAPON" },
  { icon: "🛡️", key: "ARMOR" },
  { icon: "🔧", key: "TOOL" },
];

export const SKILLS_BY_CATEGORY: ReadonlySkillsByCategory =
  groupSkillsByCategory(EQUIPPED_SKILLS);

function groupSkillsByCategory(
  skills: readonly EquipmentSlot[],
): ReadonlySkillsByCategory {
  const grouped: SkillsByCategory = {
    ARMOR: [],
    TOOL: [],
    WEAPON: [],
  };
  for (const skill of skills) {
    grouped[skill.category].push(skill);
  }
  return grouped;
}
