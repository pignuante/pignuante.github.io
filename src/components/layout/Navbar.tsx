import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useScheme } from "../../contexts/SchemeContext";
import { type ColorScheme, schemeConfig } from "../../styles/tokens";
import { type NavItem, isActivePath } from "../../utils/routing";

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Travel", path: "/travel" },
  { external: true, label: "History", path: "/history/" },
];

const schemeKeys = Object.keys(schemeConfig) as ColorScheme[];

/** Shared nav link classes (DRY: desktop uses px-4 py-2, mobile uses px-6 py-3) */
function getNavLinkClass(isActive: boolean, padding: string): string {
  return `block ${padding} text-sm transition-colors ${
    isActive
      ? "bg-[var(--interactive-active)] text-[var(--text-primary)]"
      : "text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
  }`;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { scheme, setScheme } = useScheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock (with iOS Safari position:fixed trick)
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Escape key closes menu and returns focus to hamburger
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <header
      className="fixed top-0 z-50 w-full border-b-[3px] border-[var(--border-strong)] bg-[var(--surface)]"
      style={{ boxShadow: "0 3px 0 0 var(--pixel-shadow-color)" }}
    >
      <nav
        aria-label="메인 내비게이션"
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3"
      >
        {/* Logo */}
        <Link
          className="font-pixel text-sm font-semibold tracking-tight text-[var(--text-primary)]"
          to="/"
        >
          AI Scream
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-1" role="list">
            {navItems.map(({ external, label, path }) => {
              const active = !external && isActivePath(path, pathname);
              return (
                <li key={path}>
                  {external ? (
                    <a
                      className={getNavLinkClass(false, "px-4 py-2")}
                      href={path}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={getNavLinkClass(active, "px-4 py-2")}
                      to={path}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop scheme switcher — dots flush together */}
          <div
            aria-label="색상 테마"
            className="flex min-h-[44px] items-center px-2"
            role="radiogroup"
          >
            {schemeKeys.map((s) => (
              <button
                aria-checked={scheme === s}
                aria-label={schemeConfig[s].label}
                className="relative"
                key={s}
                onClick={() => setScheme(s)}
                role="radio"
                style={{
                  backgroundColor: schemeConfig[s].preview,
                  height: "16px",
                  outline:
                    scheme === s ? "2px solid var(--border-strong)" : "none",
                  outlineOffset: "-2px",
                  width: "16px",
                }}
                type="button"
              />
            ))}
          </div>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="flex flex-col items-center justify-center gap-[3px] lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          ref={menuButtonRef}
          style={{ minHeight: "44px", minWidth: "44px" }}
          type="button"
        >
          <span
            style={{
              backgroundColor: "var(--text-primary)",
              display: "block",
              height: "3px",
              transform: isOpen
                ? "translateY(6px) rotate(45deg)"
                : "translateY(0) rotate(0)",
              transition: "transform 0.2s linear",
              width: "20px",
            }}
          />
          <span
            style={{
              backgroundColor: "var(--text-primary)",
              display: "block",
              height: "3px",
              opacity: isOpen ? 0 : 1,
              transition: "opacity 0.2s linear",
              width: "20px",
            }}
          />
          <span
            style={{
              backgroundColor: "var(--text-primary)",
              display: "block",
              height: "3px",
              transform: isOpen
                ? "translateY(-6px) rotate(-45deg)"
                : "translateY(0) rotate(0)",
              transition: "transform 0.2s linear",
              width: "20px",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu overlay + slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Semi-transparent backdrop */}
            <motion.div
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.2, ease: "linear" }}
            />

            {/* Slide-in panel from right */}
            <motion.div
              animate={{ x: 0 }}
              aria-label="모바일 메뉴"
              className="fixed top-0 right-0 z-50 flex h-full w-64 flex-col border-l-[3px] border-[var(--border-strong)] bg-[var(--surface)] lg:hidden"
              exit={{ x: "100%" }}
              id="mobile-menu"
              initial={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "linear" }}
            >
              {/* Panel header with close button */}
              <div className="flex items-center justify-between border-b-[3px] border-[var(--border-strong)] px-4 py-3">
                <span className="font-pixel text-[8px] text-[var(--text-primary)]">
                  MENU
                </span>
                <button
                  aria-label="메뉴 닫기"
                  className="flex items-center justify-center text-[var(--text-primary)]"
                  onClick={() => {
                    setIsOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                  style={{ minHeight: "44px", minWidth: "44px" }}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile nav links */}
              <ul className="flex flex-col py-2" role="list">
                {navItems.map(({ external, label, path }) => {
                  const active = !external && isActivePath(path, pathname);
                  return (
                    <li key={path}>
                      {external ? (
                        <a
                          className={getNavLinkClass(false, "px-6 py-3")}
                          href={path}
                          onClick={() => setIsOpen(false)}
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={getNavLinkClass(active, "px-6 py-3")}
                          onClick={() => setIsOpen(false)}
                          to={path}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Mobile scheme switcher */}
              <div className="mt-auto border-t-[3px] border-[var(--border-strong)] px-6 py-4">
                <p className="mb-3 text-xs text-[var(--text-tertiary)]">
                  색상 테마
                </p>
                <div
                  aria-label="색상 테마"
                  className="flex min-h-[44px] items-center"
                  role="radiogroup"
                >
                  {schemeKeys.map((s) => (
                    <button
                      aria-checked={scheme === s}
                      aria-label={schemeConfig[s].label}
                      className="relative"
                      key={s}
                      onClick={() => setScheme(s)}
                      role="radio"
                      style={{
                        backgroundColor: schemeConfig[s].preview,
                        height: "16px",
                        outline:
                          scheme === s
                            ? "2px solid var(--border-strong)"
                            : "none",
                        outlineOffset: "-2px",
                        width: "16px",
                      }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
