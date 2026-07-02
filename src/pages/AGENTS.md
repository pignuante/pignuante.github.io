<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-17 | Updated: 2026-02-19 (projects page routes sync) -->

# pages

## Purpose

Route-level page components. Each file corresponds to a URL path, lazy-loaded in `App.tsx`.

## Key Files

| File                | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `Home.tsx`          | `/` — Interactive RPG-style landing page (animated menu, keyboard navigation, dialog typing effect) |
| `About.tsx`         | `/about` — RPG-style profile page (`Character`, `Equipment`, `Quest Log`)                           |
| `Projects.tsx`      | `/projects` — Project list page rendered from dummy summary data                                    |
| `ProjectDetail.tsx` | `/projects/:slug` — Dynamic project detail page rendered from dummy detail data                     |
| `Travel.tsx`        | `/travel` — Travel page placeholder (`Pixel world map coming soon.`)                                |
| `NotFound.tsx`      | `*` — 404 page with "Go home" link                                                                  |

## For AI Agents

### Working In This Directory

- New pages must be added in 3 places:
  1. Create `PageName.tsx` here with `export default function PageName()`
  2. Add lazy import in `App.tsx`: `const PageName = lazy(() => import("./pages/PageName"))`
  3. Add `<Route>` in `App.tsx` inside the Layout route
- Optionally add to `navItems` array in `Navbar.tsx` for navigation link
- Static data arrays must be hoisted outside the component function
- Production pages should use `var()` tokens

### Common Patterns

- Placeholder page (`/travel`) uses a simple `<section className="mx-auto ... px-6 py-24">` container
- Placeholder headings use `font-pixel text-4xl font-bold tracking-tight`
- Projects routes use dummy data sources in `projects/summary-data.ts` and `projects/detail-data.ts`
- Home uses a full-viewport RPG layout (`min-h-[calc(100svh-4rem)]`, `pixel-dot-bg`) with Motion animations

<!-- MANUAL: -->
