import { motion } from "motion/react";
import { type ReactElement } from "react";
import { QUEST_ENTRIES } from "../data";
import { staggerContainer, staggerItem } from "../motion";
import { ScrollReveal } from "./ScrollReveal";

export function QuestSection(): ReactElement {
  return (
    <section aria-labelledby="about-quest-heading">
      <ScrollReveal className="mt-12">
        <h2
          className="mb-8 font-pixel text-[16px]"
          id="about-quest-heading"
          style={{ color: "var(--text-brand)" }}
        >
          <span aria-hidden="true">▶ </span>
          QUEST LOG
        </h2>
      </ScrollReveal>
      <ScrollReveal variants={staggerContainer}>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[5px] w-[3px] sm:left-[9px]"
            style={{ backgroundColor: "var(--color-brand-200)" }}
          />
          <div className="space-y-6">
            {QUEST_ENTRIES.map((entry) => {
              const isInProgress = entry.status === "IN PROGRESS";
              return (
                <motion.div
                  className="relative pl-10 sm:pl-12"
                  key={entry.id}
                  variants={staggerItem}
                >
                  <div
                    aria-hidden="true"
                    className="absolute top-4 left-[-1px] h-3 w-3 sm:left-[3px]"
                    style={{
                      backgroundColor: isInProgress
                        ? "var(--color-brand-500)"
                        : "var(--color-accent-500)",
                      border: "2px solid var(--surface-elevated)",
                      boxShadow: `0 0 0 2px ${isInProgress ? "var(--color-brand-300)" : "var(--color-accent-300)"}`,
                    }}
                  />
                  <div className="pixel-card p-4 transition-transform duration-150 hover:-translate-y-0.5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="font-pixel text-[8px] sm:text-[10px]"
                        style={{
                          color: isInProgress
                            ? "var(--text-brand)"
                            : "var(--text-accent)",
                        }}
                      >
                        [{entry.status}]
                      </span>
                      <span
                        className="font-pixel-small text-[12px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {entry.period}
                      </span>
                    </div>
                    <h3
                      className="mb-1 font-pixel-body text-[15px]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span aria-hidden="true">✦ </span>
                      {entry.title}
                    </h3>
                    <p
                      className="font-pixel-small text-[12px] leading-[1.6]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {entry.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
