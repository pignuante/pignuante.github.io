import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Dev-only: serve public/<dir>/index.html for /<dir>/ the way GitHub Pages
 * does. Without it the dev server answers /history/ with the SPA shell and
 * React Router renders its 404. `vite preview` and the deployed site already
 * behave correctly.
 */
function publicDirectoryIndex(): Plugin {
  return {
    apply: "serve",
    configureServer(server) {
      const publicDir = server.config.publicDir;
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ""] = (req.url ?? "/").split("?");
        if (pathname === "/" || /\.[^/]+$/.test(pathname)) return next();
        const dir = resolve(publicDir, `.${decodeURIComponent(pathname)}`);
        // Stay inside public/ ("/../" must not probe the filesystem).
        if (!dir.startsWith(publicDir + sep)) return next();
        if (!existsSync(resolve(dir, "index.html"))) return next();
        if (!pathname.endsWith("/")) {
          res.statusCode = 301;
          res.setHeader("Location", `${pathname}/${query ? `?${query}` : ""}`);
          res.end();
          return;
        }
        req.url = `${pathname}index.html${query ? `?${query}` : ""}`;
        next();
      });
    },
    name: "public-directory-index",
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), publicDirectoryIndex()],
});
