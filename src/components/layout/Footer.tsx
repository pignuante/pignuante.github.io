import { Link, useLocation } from "react-router";
import { type NavItem, isActivePath } from "../../utils/routing";

const YEAR = new Date().getFullYear();

const footerLinks: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Travel", path: "/travel" },
  { external: true, label: "History", path: "/history/" },
];

export default function Footer() {
  const { pathname } = useLocation();

  return (
    <footer
      aria-label="사이트 정보"
      className="border-t-[3px] border-[var(--border-strong)] bg-[var(--surface)]"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="pixel-dialog">
          {/* Nav links */}
          <nav aria-label="푸터 내비게이션">
            <ul className="flex flex-wrap gap-x-6 gap-y-2" role="list">
              {footerLinks.map(({ external, label, path }) => {
                const active = !external && isActivePath(path, pathname);
                const linkClass = `flex min-h-[44px] items-center gap-1 text-sm transition-colors ${
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`;
                const marker = (
                  <span aria-hidden="true" className="text-[var(--text-brand)]">
                    ▸
                  </span>
                );
                return (
                  <li key={path}>
                    {external ? (
                      <a className={linkClass} href={path}>
                        {marker}
                        {label}
                      </a>
                    ) : (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={linkClass}
                        to={path}
                      >
                        {marker}
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <hr className="my-4 pixel-divider" />

          {/* Copyright + GitHub */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              &copy; {YEAR} PignuAnte
            </p>
            <a
              aria-label="GitHub 저장소"
              className="flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              href="https://github.com/pignuante"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="16"
                viewBox="0 0 16 16"
                width="16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
