import { type ReactElement } from "react";
import { CharacterSection } from "./about/components/CharacterSection";
import { EquipmentSection } from "./about/components/EquipmentSection";
import { QuestSection } from "./about/components/QuestSection";
import { ScrollReveal } from "./about/components/ScrollReveal";
import { SectionDivider } from "./about/components/SectionDivider";

export default function About(): ReactElement {
  return (
    <section
      aria-labelledby="about-page-title"
      className="mx-auto max-w-5xl pixel-dot-bg px-6 py-24"
    >
      <ScrollReveal>
        <h1
          className="pixel-glow-pulse font-pixel text-[24px]"
          id="about-page-title"
          style={{ color: "var(--text-brand)" }}
        >
          <span aria-hidden="true">★ </span>
          ABOUT
        </h1>
        <p
          className="mt-3 font-pixel-body text-[15px]"
          style={{ color: "var(--text-secondary)" }}
        >
          모험가의 기록
        </p>
      </ScrollReveal>
      <SectionDivider className="mt-6" />
      <CharacterSection />
      <SectionDivider className="mt-12" />
      <EquipmentSection />
      <SectionDivider className="mt-12" />
      <QuestSection />
    </section>
  );
}
