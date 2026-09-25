import { MotionConfig } from "motion/react";
import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/layout/Layout";
import { SchemeProvider } from "./contexts/SchemeContext";

const About = lazy(() => import("./pages/About"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const Travel = lazy(() => import("./pages/Travel"));

// A data router: view transitions (Link `viewTransition`) only run under
// RouterProvider, not BrowserRouter.
const router = createBrowserRouter([
  {
    children: [
      { element: <Home />, index: true },
      { element: <About />, path: "about" },
      { element: <Projects />, path: "projects" },
      { element: <ProjectDetail />, path: "projects/:slug" },
      { element: <Travel />, path: "travel" },
      { element: <NotFound />, path: "*" },
    ],
    element: <Layout />,
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
