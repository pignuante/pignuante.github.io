import { MotionConfig } from "motion/react";
import { type ComponentType } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/layout/Layout";
import RouteError from "./components/layout/RouteError";
import { ShellFallback } from "./components/layout/SiteShell";
import { SchemeProvider } from "./contexts/SchemeContext";

/** Route-level code splitting the router can await before it navigates. */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default });
}

// A data router: view transitions (Link `viewTransition`) only run under
// RouterProvider, not BrowserRouter. Pages load through route `lazy`, so a
// navigation waits for the code before the transition starts (React.lazy
// would suspend inside it and freeze the old page).
const router = createBrowserRouter([
  {
    children: [
      { index: true, lazy: page(() => import("./pages/Home")) },
      { lazy: page(() => import("./pages/About")), path: "about" },
      { lazy: page(() => import("./pages/Projects")), path: "projects" },
      {
        lazy: page(() => import("./pages/ProjectDetail")),
        path: "projects/:slug",
      },
      { lazy: page(() => import("./pages/Travel")), path: "travel" },
      { lazy: page(() => import("./pages/NotFound")), path: "*" },
    ],
    Component: Layout,
    ErrorBoundary: RouteError,
    HydrateFallback: ShellFallback,
  },
]);

export default function App() {
  return (
    <SchemeProvider>
      {/* Motion's JS animations ignore the CSS reduced-motion rule in
          index.css; "user" makes them follow prefers-reduced-motion too. */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </SchemeProvider>
  );
}
