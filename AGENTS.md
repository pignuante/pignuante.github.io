<!-- Generated: 2026-02-17 | Updated: 2026-02-19 (projects route status sync) -->

# ai-screams.github.io

## Purpose

Personal developer portfolio and travel blog for AI Scream, deployed as a static SPA on GitHub Pages. Features a white-first pixel design with a switchable 4-scheme pastel color system, implemented `/about` and `/projects` pages (`/projects` list + `/projects/:slug` detail using dummy data), and a pixel-art UI prototype page (`/test-css-pixel`) while `/travel` remains a placeholder.

## Key Files

| File                | Description                                        |
| ------------------- | -------------------------------------------------- |
| `package.json`      | Dependencies, scripts, lint-staged config          |
| `vite.config.ts`    | Vite + React SWC + Tailwind CSS v4 plugins         |
| `tsconfig.app.json` | TypeScript strict config with `@/*` path alias     |
| `eslint.config.js`  | ESLint v9 flat config with perfectionist sorting   |
| `index.html`        | Entry HTML with scheme init + SPA redirect scripts |
| `CLAUDE.md`         | AI agent guidance for this repository              |
| `.prettierrc`       | Prettier config with tailwindcss plugin            |

## Subdirectories

| Directory            | Purpose                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `src/`               | Application source code (see `src/AGENTS.md`)                                                       |
| `public/`            | Static assets (`404.html` SPA fallback, `vite.svg` icon)                                            |
| `.github/workflows/` | CI (`ci.yml`: lint, typecheck, build, format-check, security) + Deploy (`deploy.yml`: GitHub Pages) |
| `.github/`           | `dependabot.yml` — automated npm weekly + GitHub Actions monthly updates                            |
| `.husky/`            | Git hooks (pre-commit runs lint-staged)                                                             |
| `.docs/ideas/`       | Brainstorming and planning documents                                                                |

## For AI Agents

### Working In This Directory

- Run `npm run lint` and `npm run build` to verify changes
- Production UI should use design tokens via `var()`; `TestCssPixel.tsx` is a legacy prototype with some hardcoded fallback values
- Imports must be sorted alphabetically with no blank lines between groups (perfectionist)
- JSX props and object keys must be sorted alphabetically
- Korean-first UI text with `<html lang="ko">` (current copy is partially mixed KR/EN)
- Brand name is "AI Scream" (singular), repo is "AI Screams" (plural)

### Testing Requirements

- `npm run build` (TypeScript check + Vite build) must pass
- `npm run lint` must pass with 0 errors
- Verify color scheme switching works across all 4 schemes

### Common Patterns

- White-first pixel design (no dark mode)
- Route-level code splitting with data-router route `lazy` (not `React.lazy`); first-load fallback is `ShellFallback`
- Shared state via Context Provider (React 19 `use()` API)
- 4-layer token architecture: Primitives → Schemes → Semantics → Pixel System
- Font tokens: `--font-pixel` (headings) and `--font-pixel-body` (body text)

## Dependencies

### External

- React / React DOM ^19.2.4 — UI framework (with React 19 APIs: `use()`)
- Vite ^7.3.1 — Build tool with SWC (`@vitejs/plugin-react-swc` ^4.2.3)
- Tailwind CSS / `@tailwindcss/vite` ^4.1.18 — Utility-first CSS (`@theme` directive)
- Motion ^12.34.2 — UI animation library
- React Router ^7.13.0 — Client-side routing
- TypeScript ^5.9.3 — Static type checking

### Dev Dependencies (Key)

| Package                       | Version | Purpose                                                |
| ----------------------------- | ------- | ------------------------------------------------------ |
| `eslint`                      | ^9.39.2 | Linter (flat config, v9+)                              |
| `@eslint/js`                  | ^9.39.2 | ESLint recommended config for JS                       |
| `typescript-eslint`           | ^8.56.0 | TypeScript support for ESLint                          |
| `eslint-plugin-react-hooks`   | ^7.0.1  | Rules for React Hooks (memoization, dependencies)      |
| `eslint-plugin-react-refresh` | ^0.5.0  | ESM named export: `import { reactRefresh } from "..."` |
| `eslint-plugin-perfectionist` | ^5.6.0  | Import/prop/object sorting (natural, case-insensitive) |
| `eslint-config-prettier`      | ^10.1.8 | Disables ESLint rules that conflict with Prettier      |
| `prettier`                    | ^3.8.1  | Code formatter with tailwindcss plugin                 |
| `husky`                       | ^9.1.7  | Git hooks (pre-commit)                                 |
| `lint-staged`                 | ^16.2.7 | Run linters on staged files                            |

### ESLint Config (v9 Flat Config)

File: `eslint.config.js`

```javascript
// Plugins object (alphabetical order):
plugins: {
  js,                    // @eslint/js
  perfectionist,         // sort rules
  "react-hooks",         // React Hooks rules
  "react-refresh",       // ESM export validation
},

// Rules:
- sort-imports: natural asc, newlinesBetween: 0 (no blank lines between groups)
- sort-jsx-props: natural asc, case-insensitive
- sort-objects: natural asc, case-insensitive
- react-refresh/only-export-components: warn + allowConstantExport: true + allowExportNames: ["useScheme"]
- @typescript-eslint/no-unused-vars: error (argsIgnorePattern: "^_")
```

### GitHub Actions (CI/CD)

| Workflow     | Trigger                          | Jobs                                           |
| ------------ | -------------------------------- | ---------------------------------------------- |
| `ci.yml`     | Pull request (to `main`)         | lint, typecheck, build, format-check, security |
| `deploy.yml` | Push to `main` + manual dispatch | build + GitHub Pages deploy                    |

CI uses Node.js 22 across all jobs.

All actions SHA-pinned:

- `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2)
- `actions/setup-node@6044e13b5dc448c55e2357c09f80417699197238` (v6.2.0)
- `actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b` (v4.0.0)
- `actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` (v4.0.5)

Security checks:

- `npm audit --omit=dev --audit-level=high`
- `gitleaks` v8.30.0 (CLI, installed via curl from releases)

<!-- MANUAL: -->
