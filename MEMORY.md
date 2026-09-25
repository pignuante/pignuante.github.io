# MEMORY

Last updated: 2026-02-19

## Git Facts

- Active branch: `feat/phase3-projects`
- Local HEAD: `eec989412a3be55a455de8b64aab3be38a19c175` (`eec9894 Merge pull request #12 from ai-screams/feat/phase2-home`)
- `main` reference: `eec989412a3be55a455de8b64aab3be38a19c175` (`eec9894 Merge pull request #12 from ai-screams/feat/phase2-home`)

## Route + Architecture Snapshot

- Router (`src/App.tsx`): `SchemeProvider -> MotionConfig -> RouterProvider` (data router, `createBrowserRouter`); pages load via route `lazy`
- Route shell (`src/components/layout/Layout.tsx`): `SiteShell` (Navbar/Footer), route-loading bar, `ScrollRestoration`; page changes are view transitions
- Route status: implemented `/, /about, /projects, /projects/:slug, /colors, /test-css-pixel, *`; placeholder `/travel`
- Theme state (`src/contexts/SchemeContext.tsx`): React 19 `use()` context hook, `data-scheme` + `localStorage` persistence
- Token architecture (`src/styles/tokens.css` + `src/styles/tokens.ts`): Primitives -> Schemes -> Semantics -> Pixel System (4 schemes: `aurora`, `cotton`, `matcha`, `peach`)

## CI / Deploy Security Baseline

- CI workflow (`.github/workflows/ci.yml`): `lint`, `typecheck`, `build`, `format-check`, `security` on PRs to `main`
- Security job baseline: `npm audit --omit=dev --audit-level=high` and `gitleaks detect --source . --verbose` (full git history via `fetch-depth: 0`)
- Deploy workflow (`.github/workflows/deploy.yml`): GitHub Pages deploy on push to `main` or `workflow_dispatch`
- Workflow runtime baseline: Node.js `22`; actions are SHA-pinned (`checkout`, `setup-node`, `upload-pages-artifact`, `deploy-pages`)
