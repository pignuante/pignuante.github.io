import type { CSSProperties, JSX, RefCallback } from "react";
import { motion, type Variants, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import type { HomeMenuItem } from "../constants";
import { duration, easing } from "../../../styles/tokens";

function createMenuVariants(prefersReducedMotion: boolean): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: {},
      visible: { transition: { delayChildren: 0, staggerChildren: 0 } },
    };
  }

  return {
    hidden: {},
    visible: { transition: { delayChildren: 0.15, staggerChildren: 0.1 } },
  };
}

function createMenuItemVariants(prefersReducedMotion: boolean): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { y: 0 },
      visible: {
        transition: { duration: 0 },
        y: 0,
      },
    };
  }

  return {
    hidden: { y: 8 },
    visible: {
      transition: { duration: duration.normal, ease: easing.snappy },
      y: 0,
    },
  };
}

interface HomeMenuProps {
  items: ReadonlyArray<HomeMenuItem>;
  onSelect: (index: number) => void;
  registerLinkRef: (index: number) => RefCallback<HTMLElement>;
  renderItem?: (params: HomeMenuRenderItemParams) => JSX.Element;
  selectedIndex: number;
}

interface HomeMenuRenderItemParams {
  ariaLabel: string;
  children: JSX.Element;
  className: string;
  item: HomeMenuItem;
  itemRef: RefCallback<HTMLElement>;
  onFocus: () => void;
  style: CSSProperties;
}

function renderDefaultItem({
  ariaLabel,
  children,
  className,
  item,
  itemRef,
  onFocus,
  style,
}: HomeMenuRenderItemParams): JSX.Element {
  return (
    <Link
      aria-label={ariaLabel}
      className={className}
      onFocus={onFocus}
      ref={itemRef}
      style={style}
      to={item.path}
      viewTransition
    >
      {children}
    </Link>
  );
}

export default function HomeMenu({
  items,
  onSelect,
  registerLinkRef,
  renderItem,
  selectedIndex,
}: HomeMenuProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const menuVariants: Variants = createMenuVariants(prefersReducedMotion);
  const menuItemVariants: Variants =
    createMenuItemVariants(prefersReducedMotion);

  return (
    <nav aria-label="주요 메뉴" className="w-full">
      <motion.ul
        animate="visible"
        className="flex flex-col items-center gap-2"
        initial="hidden"
        variants={menuVariants}
      >
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const ariaLabel = `${item.label} — ${item.desc}`;
          const className =
            "group flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-sm px-4 py-2 transition-all duration-150 focus:outline-none";
          const onFocus = () => onSelect(index);
          const itemRef = registerLinkRef(index);
          const style: CSSProperties = {
            backgroundColor: isSelected
              ? "var(--color-brand-50)"
              : "transparent",
            boxShadow: isSelected
              ? "inset 0 0 0 2px var(--color-brand-200)"
              : "none",
          };
          const children = (
            <>
              <span
                className="flex items-center gap-2 font-pixel text-xs transition-colors duration-150 sm:text-sm"
                style={{
                  color: isSelected
                    ? "var(--text-brand)"
                    : "var(--text-primary)",
                }}
              >
                <span
                  aria-hidden="true"
                  className={isSelected ? "pixel-arrow-bounce" : ""}
                  style={{
                    opacity: isSelected ? 1 : 0,
                    transition: "opacity 0.15s",
                  }}
                >
                  ▸
                </span>
                {item.label}
              </span>
              <span
                className="font-pixel-small text-[12px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.desc}
              </span>
            </>
          );

          return (
            <motion.li key={item.path} variants={menuItemVariants}>
              {(renderItem ?? renderDefaultItem)({
                ariaLabel,
                children,
                className,
                item,
                itemRef,
                onFocus,
                style,
              })}
            </motion.li>
          );
        })}
      </motion.ul>
    </nav>
  );
}
