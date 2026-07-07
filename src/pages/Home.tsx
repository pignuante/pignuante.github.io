import type { JSX } from "react";
import { motion, type Variants, useReducedMotion } from "motion/react";
import SparkDivider from "../components/ui/SparkDivider";
import { duration, easing } from "../styles/tokens";
import HomeMenu from "./home/components/HomeMenu";
import IntroDialog from "./home/components/IntroDialog";
import { HOME_INTRO_TEXT, HOME_MENU_ITEMS } from "./home/constants";
import { useIntroDialog } from "./home/useIntroDialog";
import { useMenuNavigation } from "./home/useMenuNavigation";

function createLiftInVariants(
  yOffset: number,
  prefersReducedMotion: boolean,
  delay: number = 0,
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { y: 0 },
      visible: {
        transition: { delay: 0, duration: 0 },
        y: 0,
      },
    };
  }

  return {
    hidden: { y: yOffset },
    visible: {
      transition: { delay, duration: duration.slow, ease: easing.snappy },
      y: 0,
    },
  };
}

export default function Home(): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { registerLinkRef, selectedIndex, setSelectedIndex } =
    useMenuNavigation(HOME_MENU_ITEMS.length);
  const { dialogOpen, displayedText, toggleDialog, typingDone } =
    useIntroDialog(HOME_INTRO_TEXT);
  const titleMotionVariants: Variants = createLiftInVariants(
    -12,
    prefersReducedMotion,
  );
  const subtitleMotionVariants: Variants = createLiftInVariants(
    -8,
    prefersReducedMotion,
    0.1,
  );
  const dividerMotionVariants: Variants = createLiftInVariants(
    4,
    prefersReducedMotion,
    0.3,
  );
  const dialogMotionVariants: Variants = createLiftInVariants(
    8,
    prefersReducedMotion,
    0.4,
  );

  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-8 pixel-dot-bg px-6 py-12">
      {/* ★ Title with glow pulse */}
      <motion.h1
        animate="visible"
        className="pixel-glow-pulse font-pixel text-lg leading-tight tracking-tight sm:text-2xl md:text-4xl"
        initial="hidden"
        style={{ color: "var(--text-brand)" }}
        variants={titleMotionVariants}
      >
        ★ PIGNUANTE ★
      </motion.h1>

      <motion.p
        animate="visible"
        className="font-pixel-body text-base sm:text-lg"
        initial="hidden"
        style={{ color: "var(--text-secondary)" }}
        variants={subtitleMotionVariants}
      >
        Developer. Traveler. Creator.
      </motion.p>

      <HomeMenu
        items={HOME_MENU_ITEMS}
        onSelect={setSelectedIndex}
        registerLinkRef={registerLinkRef}
        selectedIndex={selectedIndex}
      />

      {/* ★ Decorative RPG divider */}
      <motion.div
        animate="visible"
        className="w-full max-w-xs"
        initial="hidden"
        variants={dividerMotionVariants}
      >
        <SparkDivider />
      </motion.div>

      {/* ★ Dialog box with speaker badge */}
      <motion.div
        animate="visible"
        className="w-full max-w-lg"
        initial="hidden"
        variants={dialogMotionVariants}
      >
        <IntroDialog
          dialogOpen={dialogOpen}
          displayedText={displayedText}
          onToggle={toggleDialog}
          typingDone={typingDone}
        />
      </motion.div>
    </section>
  );
}
