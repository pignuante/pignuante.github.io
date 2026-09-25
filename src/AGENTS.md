<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-17 | Updated: 2026-02-19 (routing + suspense ownership sync) -->

# src

## Purpose

Application source code. Entry point is `main.tsx` which renders `App.tsx` into the DOM. All React components, pages, contexts, and styles live here.

## Key Files

| File            | Description                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| `main.tsx`      | Entry point — `createRoot` (StrictMode intentionally off; see the note in the file)  |
| `App.tsx`       | Data router: `createBrowserRouter` + `RouterProvider`, pages via route `lazy`        |
| `index.css`     | Tailwind v4 import, base styles, pixel `@utility` patterns (card, btn, dialog, etc.) |
| `vite-env.d.ts` | Vite client type declarations                                                        |

## Subdirectories

| Directory     | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| `components/` | Reusable UI components (see `components/AGENTS.md`)          |
| `contexts/`   | React context providers (see `contexts/AGENTS.md`)           |
| `pages/`      | Route-level page components (see `pages/AGENTS.md`)          |
| `styles/`     | Design tokens and theme definitions (see `styles/AGENTS.md`) |
| `utils/`      | Shared utility functions and types (see `utils/AGENTS.md`)   |

## For AI Agents

### Working In This Directory

- `App.tsx` wraps everything in: `SchemeProvider` → `MotionConfig` → `RouterProvider` (data router; needed for Link `viewTransition`)
- New pages load through route `lazy`: `{ lazy: page(() => import("./pages/Page")), path: "page" }` (not `React.lazy`, which would suspend inside a view transition)
- New routes go in the root route's `children`; the root route has `Component: Layout`, `ErrorBoundary: RouteError`, `HydrateFallback: ShellFallback`
- Path alias `@/*` maps to `./src/*` (defined in tsconfig)

### Common Patterns

- All route pages load through route `lazy` in `App.tsx` for code splitting
- The first-load fallback is `ShellFallback` (`components/layout/SiteShell.tsx`)

## Dependencies

### Internal

- `styles/tokens.css` imported via `index.css`
- `contexts/SchemeContext.tsx` wraps the entire app

<!-- MANUAL: -->
