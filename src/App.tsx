import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/layout/Layout";
import { SchemeProvider } from "./contexts/SchemeContext";

const About = lazy(() => import("./pages/About"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const Travel = lazy(() => import("./pages/Travel"));

export default function App() {
  return (
    <SchemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<Home />} index />
            <Route element={<About />} path="about" />
            <Route element={<Projects />} path="projects" />
            <Route element={<ProjectDetail />} path="projects/:slug" />
            <Route element={<Travel />} path="travel" />
            <Route element={<NotFound />} path="*" />
          </Route>
        </Routes>
      </BrowserRouter>
    </SchemeProvider>
  );
}
