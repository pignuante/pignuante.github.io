# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (default port 5173)
npm run build        # TypeScript check + Vite production build (tsc -b && vite build)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all src files
npm run format:check # Prettier check (CI)
npm run bake:world   # Regenerate public/world-grid.{png,json} from world-atlas
node scripts/bake-timezones.mjs  # Regenerate travel/timezone-coords.json (pinned tzdb, needs network)
scripts/subset-fonts.py          # Re-subset Galmuri -> PignuPixel woff2 (fonttools+brotli; see header)
```

Pre-commit hook (Husky + lint-staged) runs `eslint --fix` and `prettier --write` on staged files automatically.

## Architecture

**AI Scream** — personal developer portfolio + travel blog, deployed to GitHub Pages as a static SPA.

### Tech Stack

- React 19 + TypeScript 6 + Vite 8 (SWC plugin)
- Tailwind CSS v4 (`@theme` directive, no tailwind.config — configured in `src/styles/tokens.css`)
- Motion v12 (page transitions in Layout)
- React Router 8 (BrowserRouter, route-level lazy loading)
- PixiJS 8 + @pixi/react 8 + d3-geo (Travel maps)

### Key Patterns

**Design Token System** (`src/styles/tokens.css` + `src/styles/tokens.ts`):

- 4-layer architecture: Primitives (`@theme`) → Schemes (`[data-scheme]`) → Semantics (`:root`) → Pixel System (`:root`)
- oklch color space throughout
- 4 switchable color schemes: Aurora Dream (default, lavender+mint), Cotton Sky (rose+skyblue), Matcha Garden (green+yellow-green), Peach Blossom (peach+gold)
- CSS variables consumed via `var(--token-name)` — never hardcode color values (PixiJS exception: see Gotchas)
- `tokens.ts` exports JS-accessible values for PixiJS/Motion (must stay in sync with CSS)

**Color Scheme Context** (`src/contexts/SchemeContext.tsx`):

- `SchemeProvider` wraps the app, manages `data-scheme` attribute + localStorage persistence
- Consume via `useScheme()` hook (React 19 `use()` API)
- `index.html` has inline script to prevent scheme flash on load

**Routing** (`src/App.tsx`):

- All pages lazy-loaded with `React.lazy()` + `Suspense`
- GitHub Pages SPA fallback via `public/404.html` → sessionStorage redirect

**Layout** (`src/components/layout/`):

- `Layout.tsx` — Navbar + AnimatePresence page transition + Footer
- `Navbar.tsx` — pixel-style fixed header with hard-edge border, nav links, 4-dot scheme switcher, and mobile hamburger menu
- `src/utils/routing.ts` — shared `NavItem` type and `isActivePath()` helper used by Navbar and Footer

**Pages** (`src/pages/`): `Home.tsx`, `About.tsx`, `Projects.tsx`, `ProjectDetail.tsx`, `Travel.tsx`, each with a folder (`home/ about/ projects/ travel/`) holding its components and data (`data.ts`, `summary-data.ts`, …)

**Travel maps** (`src/pages/travel/`):

- `WorldPixelMap.tsx` (flat) / `GlobePixelMap.tsx` (globe) render; `Travel.tsx` drives them with `useMapCamera` (flat) and `useGlobeDrag` + `useZoom` (globe)
- `zoomMath.ts` — whole-pixel zoom levels and `settleZoom`; `usePixelSnappedWidth` + `useRendererResolution` keep the canvas 1:1
- `visitorLocation.ts` + `HereOverlay.tsx` — visitor pin from time zone or opt-in Geolocation

### Conventions

- **White-first**: Single light theme only — no dark mode
- **Korean**: UI text and comments may be in Korean; `<html lang="ko">`
- **Brand name**: "AI Scream" (singular), repo name is "AI Screams" (plural)
- **Path alias**: `@/*` maps to `./src/*`

## CI/CD

**CI Pipeline** (`.github/workflows/ci.yml`) — runs on pull requests to main:

- 5 parallel jobs: lint (`npm run lint`), typecheck (`npx tsc -b`), build (`npm run build`), format-check (`npm run format:check`), security (npm audit + gitleaks)
- All GitHub Actions pinned to commit SHAs for supply chain security
- Least-privilege permissions (`contents: read` only)

**Deploy Pipeline** (`.github/workflows/deploy.yml`) — runs on push to main:

- Builds dist artifact and deploys to GitHub Pages
- Triggered on push to `main` or manual `workflow_dispatch`

**Dependabot** (`.github/dependabot.yml`):

- npm: weekly updates (Mondays), minor/patch grouped into single PR
- GitHub Actions: monthly updates
- Commit prefixes: `chore(deps):` / `chore(ci):`

## Lint Rules

ESLint 10 flat config with `eslint-plugin-perfectionist`:

- **sort-imports**: natural ascending, no blank lines between import groups (`newlinesBetween: 0`)
- **sort-jsx-props**: alphabetical, case-insensitive
- **sort-objects**: alphabetical, case-insensitive

`eslint-config-prettier` is applied last to avoid conflicts. Prettier uses `prettier-plugin-tailwindcss` for class sorting.

## Gotchas

- No test runner: verify UI with puppeteer-core driving local Chrome (headless); lint/tsc/format/build are the only gates
- Pixel comparisons: wait about 2s after navigation (a page transition still running at 300ms gives false diffs)
- puppeteer `ElementHandle.click()` scrolls the page and invalidates saved clip rects; use `el.evaluate((e) => e.click())`
- The global reduced-motion rule in `index.css` ends animations instantly, so an element's base style must be its resting frame
- Colour tokens: PixiJS can't read CSS vars, so only `tokens.ts` and `travel/constants.ts` hold numeric colours (keep in sync with `tokens.css`)
- Travel maps are pixel-exact: canvas width snapped to whole device px per cell, renderer backing store 1:1, zoom rests on m/k levels; fractional offsets change the grid phase
- Generated files (`timezone-coords.json`, `world-grid-meta.json`): regenerate via scripts, don't hand-edit (the timezone JSON is in `.prettierignore`)
- `.docs/` is gitignored internal notes; never commit it
