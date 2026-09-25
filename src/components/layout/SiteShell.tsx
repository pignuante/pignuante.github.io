import { type ReactElement, type ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

/** Navbar + main + Footer, shared by the layout, the first-load fallback and the error page. */
export function SiteShell({
  busy = false,
  children,
}: {
  busy?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main aria-busy={busy || undefined} className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function RouteFallback(): ReactElement {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-5xl px-6 py-24"
    >
      <div className="pixel-card p-6">
        <p className="font-pixel-body text-[15px] text-[var(--text-secondary)]">
          페이지를 불러오는 중...
        </p>
      </div>
    </section>
  );
}

/** Shown while the first page's code loads (data-router HydrateFallback). */
export function ShellFallback(): ReactElement {
  return (
    <SiteShell busy>
      <RouteFallback />
    </SiteShell>
  );
}
