import { motion } from "motion/react";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { duration, easing } from "../../styles/tokens";
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
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          key={pathname}
          transition={{ duration: duration.fast, ease: easing.smooth }}
        >
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
