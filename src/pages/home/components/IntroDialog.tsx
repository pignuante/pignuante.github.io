import type { JSX } from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import PixelDialogHeader from "../../../components/ui/PixelDialogHeader";
import { duration, easing } from "../../../styles/tokens";

const BLINK_TRANSITION: Omit<Transition, "duration"> = {
  repeat: Infinity,
  repeatType: "reverse",
};

interface IntroDialogProps {
  dialogOpen: boolean;
  displayedText: string;
  onToggle: () => void;
  typingDone: boolean;
}

export default function IntroDialog({
  dialogOpen,
  displayedText,
  onToggle,
  typingDone,
}: IntroDialogProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const contentTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: duration.normal, ease: easing.smooth };
  const buttonTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: duration.fast };
  const openDialogAnimation = prefersReducedMotion
    ? { height: "auto", opacity: 1 }
    : { height: 0, opacity: 0 };
  const closedDialogAnimation = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 0 };

  return (
    <section aria-label="소개 대화창" className="pixel-dialog">
      <div className="mb-3 flex items-center justify-between gap-2">
        <PixelDialogHeader
          iconColor="var(--surface-elevated)"
          label="PignuAnte"
        />
        {dialogOpen && (
          <button
            aria-controls="home-intro-dialog-content"
            aria-expanded={dialogOpen}
            className="cursor-pointer font-pixel-body text-xs"
            onClick={onToggle}
            style={{ color: "var(--text-secondary)" }}
            type="button"
          >
            ▲ 접기
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {dialogOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={openDialogAnimation}
            id="home-intro-dialog-content"
            initial={openDialogAnimation}
            key="open"
            style={{ overflow: "hidden" }}
            transition={contentTransition}
          >
            <p
              aria-atomic="true"
              aria-live="polite"
              className="font-pixel-body text-sm leading-relaxed whitespace-pre-line"
              style={{ color: "var(--text-primary)" }}
            >
              {displayedText}
              {!typingDone && (
                <>
                  {prefersReducedMotion ? (
                    <span aria-hidden="true">▌</span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      aria-hidden="true"
                      transition={{
                        duration: 0.5,
                        ...BLINK_TRANSITION,
                      }}
                    >
                      ▌
                    </motion.span>
                  )}
                </>
              )}
            </p>
          </motion.div>
        ) : (
          <motion.button
            animate={{ opacity: 1 }}
            aria-controls="home-intro-dialog-content"
            aria-expanded={dialogOpen}
            className="cursor-pointer border-0 bg-transparent p-0 text-left font-pixel-body text-sm"
            initial={closedDialogAnimation}
            key="closed"
            onClick={onToggle}
            style={{ color: "var(--text-secondary)" }}
            transition={buttonTransition}
            type="button"
          >
            ▶ 대화를 시작하려면 클릭하세요
            {prefersReducedMotion ? (
              <span aria-hidden="true">...</span>
            ) : (
              <motion.span
                animate={{ opacity: [1, 0] }}
                aria-hidden="true"
                transition={{
                  duration: 0.7,
                  ...BLINK_TRANSITION,
                }}
              >
                ...
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {dialogOpen && typingDone && (
        <div className="mt-4 flex justify-end">
          <button
            className="pixel-btn font-pixel-body text-xs hover:pixel-btn-hover active:pixel-btn-active"
            onClick={onToggle}
            style={{ color: "var(--text-primary)" }}
            type="button"
          >
            ▶ 시작
          </button>
        </div>
      )}
    </section>
  );
}
