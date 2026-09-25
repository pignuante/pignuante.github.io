import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import Footer from "./Footer";
import Navbar from "./Navbar";

function RouteFallback() {
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

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Page changes animate as view transitions (index.css) */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      {/* New pages open at the top; back/forward restore the old position */}
      <ScrollRestoration />
    </div>
  );
}
