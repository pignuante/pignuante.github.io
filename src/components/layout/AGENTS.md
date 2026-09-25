<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-17 | Updated: 2026-02-19 (layout transition + suspense sync) -->

# layout

## Purpose

App shell components that wrap every page. Provides the persistent Navbar, route-level suspense boundary + transition wrapper, and Footer.

## Key Files

| File             | Description                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Layout.tsx`     | Root route component — `SiteShell` around `<Outlet />`, loading bar while route code loads, `ScrollRestoration`; page changes are view transitions (Motion fade only without the API)        |
| `SiteShell.tsx`  | Navbar + `main` + Footer frame, plus `RouteFallback` / `ShellFallback` (first-load HydrateFallback)                                                                                          |
| `RouteError.tsx` | Root `ErrorBoundary`: branded error page, reload for a stale chunk after a deploy, no error details                                                                                          |
| `Navbar.tsx`     | Pixel-style fixed header with 3px hard-edge border+shadow, nav links, 4-dot color scheme switcher, and mobile hamburger menu with slide-in panel. Consumes `useScheme()` and `isActivePath`. |
| `Footer.tsx`     | RPG pixel-dialog footer — nav links with `▸` prefix, `pixel-divider` `<hr>`, copyright, and GitHub link. Uses `pixel-dialog` utility class and `isActivePath` from `utils/routing`.          |

## For AI Agents

### Working In This Directory

- `Layout.tsx` is the route parent — it receives child pages via `<Outlet />`
- Page changes run as view transitions (`index.css` section 9); `site-header`, `nav-active` and `project-thumb-<slug>` are the named elements, and each name must appear once per page
- Navbar uses `border-b-[3px] border-[var(--border-strong)] bg-[var(--surface)]` with pixel box-shadow (no glassmorphism)
- Navbar uses `font-pixel` for brand name, not `font-display`
- Scheme switcher iterates `schemeConfig` from `styles/tokens.ts` (4 schemes: aurora, cotton, matcha, peach)
- Navigation items are defined as `NavItem[]` arrays in each file — add new nav links to both `navItems` (Navbar) and `footerLinks` (Footer)
- Navbar mobile menu: hamburger button (lg:hidden), `AnimatePresence` overlay + slide-in panel from right, body scroll lock with iOS Safari fix, Escape key closes menu
- Footer excludes `/colors` route from `footerLinks` (developer-only page)

### Common Patterns

- Active nav link detection: `isActivePath(path, pathname)` from `utils/routing` — exact match for `/`, prefix match for others
- Scheme dots: `Object.keys(schemeConfig) as ColorScheme[]` renders in alphabetical order (aurora, cotton, matcha, peach)
- Token imports: `duration` and `easing` from `styles/tokens.ts` for animation config
- Touch targets: hamburger/close controls and footer links enforce 44px minimums; scheme dots are currently 16x16

## Dependencies

### Internal

- `contexts/SchemeContext.tsx` — `useScheme()` hook in Navbar
- `styles/tokens.ts` — `schemeConfig`, `ColorScheme` type, `duration`, `easing`
- `utils/routing.ts` — `NavItem` type, `isActivePath()` helper (used in both Navbar and Footer)

### External

- `motion/react` — fallback route fade when View Transitions are unsupported (Layout), `AnimatePresence` + `motion.div` mobile menu transitions (Navbar)
- `react-router` — `Link`, `useLocation`, `Outlet`

<!-- MANUAL: -->
