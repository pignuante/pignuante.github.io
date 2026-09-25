import { motion } from "motion/react";
import { type ReactElement } from "react";
import { INVENTORY_ITEMS, SKILL_CATEGORIES, SKILLS_BY_CATEGORY } from "../data";
import { staggerContainer, staggerItem } from "../motion";
import { ScrollReveal } from "./ScrollReveal";
import { StarRating } from "./StarRating";

export function EquipmentSection(): ReactElement {
  return (
    <section aria-labelledby="about-equipment-heading">
      <ScrollReveal className="mt-12">
        <h2
          className="mb-6 font-pixel text-[16px]"
          id="about-equipment-heading"
          style={{ color: "var(--text-brand)" }}
        >
          <span aria-hidden="true">▶ </span>
          EQUIPMENT & INVENTORY
        </h2>
      </ScrollReveal>
      {SKILL_CATEGORIES.map((category) => (
        <ScrollReveal
          className="mt-6"
          key={category.key}
          variants={staggerContainer}
        >
          <h3
            className="mb-3 font-pixel text-[16px]"
            style={{ color: "var(--text-secondary)" }}
          >
            <span aria-hidden="true">{category.icon} </span>
            {category.key}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS_BY_CATEGORY[category.key].map((skill) => (
              <motion.div
                className="pixel-card p-3 transition-transform duration-150 hover:-translate-y-0.5"
                key={skill.id}
                variants={staggerItem}
              >
                <p
                  className="font-pixel-body text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {skill.label}
                </p>
                <div className="mt-1">
                  <StarRating label={skill.label} stars={skill.stars} />
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      ))}
      <ScrollReveal className="mt-8" variants={staggerContainer}>
        <h3
          className="mb-3 font-pixel text-[16px]"
          style={{ color: "var(--text-secondary)" }}
        >
          <span aria-hidden="true">🎒 </span>
          INVENTORY
        </h3>
        <div className="flex flex-wrap gap-2">
          {INVENTORY_ITEMS.map((item) => (
            <motion.span
              className="inline-flex items-center pixel-card px-3 py-1.5 font-pixel-small text-[12px] transition-colors duration-150 hover:border-[var(--color-brand-300)]"
              key={item.id}
              style={{ color: "var(--text-primary)" }}
              variants={staggerItem}
            >
              + {item.label}
            </motion.span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
