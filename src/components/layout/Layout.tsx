import { motion } from "motion/react";
import { Suspense } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router";
import { duration, easing } from "../../styles/tokens";
import { RouteFallback, SiteShell } from "./SiteShell";

/** Browsers with the View Transitions API animate page changes in CSS. */
const SUPPORTS_VIEW_TRANSITIONS =
  typeof document !== "undefined" && "startViewTransition" in document;

export default function Layout() {
  const { pathname } = useLocation();
  // Route code loads before the view transition starts, while the old page
  // stays up; the bar says something is happening.
  const loading = useNavigation().state !== "idle";

  const page = (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  );

  return (
    <SiteShell busy={loading}>
      {loading ? (
        <div
          aria-hidden="true"
          className="fixed top-16 left-0 z-40 h-[3px] w-full pixel-loading-bar"
        />
      ) : null}
      {SUPPORTS_VIEW_TRANSITIONS ? (
        page
      ) : (
        // No View Transitions API: keep the old Motion fade
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          key={pathname}
          transition={{ duration: duration.fast, ease: easing.smooth }}
        >
          {page}
        </motion.div>
      )}
      {/* New pages open at the top; back/forward restore the old position */}
      <ScrollRestoration />
    </SiteShell>
  );
}
