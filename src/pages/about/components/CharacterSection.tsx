import { type ReactElement } from "react";
import PixelDialogHeader from "../../../components/ui/PixelDialogHeader";
import { CHARACTER_BIO, CHARACTER_INFO, CHARACTER_STATS } from "../data";
import { JobTree } from "./JobTree";
import { ScrollReveal } from "./ScrollReveal";

export function CharacterSection(): ReactElement {
  return (
    <section aria-labelledby="about-character-heading">
      <ScrollReveal className="mt-10">
        <h2 className="sr-only" id="about-character-heading">
          CHARACTER
        </h2>
        <div className="pixel-dialog">
          <PixelDialogHeader className="mb-4" label="CHARACTER" />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative flex-shrink-0">
              <div
                className="pixel-card p-1"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  boxShadow:
                    "var(--pixel-shadow-md), inset 0 0 0 2px var(--color-brand-200)",
                }}
              >
                <div
                  style={{
                    border: "2px solid var(--color-brand-300)",
                    borderRadius: "var(--pixel-border-radius)",
                  }}
                >
                  <img
                    alt={`${CHARACTER_INFO.name} 캐릭터 초상화`}
                    className="h-28 w-28 object-contain sm:h-36 sm:w-36"
                    src="/images/main-character.png"
                  />
                </div>
              </div>
              <span
                className="absolute -right-2 -bottom-2 font-pixel text-[8px]"
                style={{
                  backgroundColor: "var(--text-brand)",
                  borderRadius: "var(--pixel-border-radius)",
                  boxShadow: "var(--pixel-shadow-sm)",
                  color: "var(--surface)",
                  padding: "2px 6px",
                }}
              >
                LV.{CHARACTER_INFO.level}
              </span>
            </div>
            <div className="flex-1">
              <h3
                className="font-pixel text-[16px]"
                style={{ color: "var(--text-primary)" }}
              >
                {CHARACTER_INFO.name}
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {CHARACTER_STATS.map((stat) => (
                  <div
                    className="rounded-sm p-2"
                    key={stat.id}
                    style={{ backgroundColor: "var(--surface-elevated)" }}
                  >
                    <dt
                      className="font-pixel text-[8px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {stat.label}
                    </dt>
                    <dd
                      className="mt-1 font-pixel-body text-[15px]"
                      style={{
                        color:
                          stat.id === "lvl"
                            ? "var(--text-brand)"
                            : "var(--text-primary)",
                      }}
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p
                className="mt-4 font-pixel-body text-[15px] leading-[1.7] whitespace-normal sm:whitespace-pre-line"
                style={{ color: "var(--text-primary)" }}
              >
                {CHARACTER_BIO}
                <span aria-hidden="true"> ★</span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <JobTree />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
