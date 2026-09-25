<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-17 | Updated: 2026-02-19 (provider chain sync) -->

# contexts

## Purpose

React context providers for shared application state. Providers are wrapped at app root in `App.tsx`.

## Key Files

| File                | Description                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `SchemeContext.tsx` | Color scheme provider — manages `data-scheme` attribute, localStorage, exposes `useScheme()` |

## For AI Agents

### Working In This Directory

- Each context exports a Provider component + a `use*()` hook
- Use React 19 `use()` API (not `useContext()`) for consumption
- `useScheme()` is allowlisted in ESLint `react-refresh/only-export-components`
- New context hooks must be added to `allowExportNames` in `eslint.config.js`
- Provider/router wrapping in `App.tsx`: `SchemeProvider` → `MotionConfig` → `RouterProvider` (data router)
- `VALID_SCHEMES` in `SchemeContext.tsx` contains all 4 schemes: `"aurora"`, `"cotton"`, `"matcha"`, `"peach"`
- When adding a new scheme, add it to `VALID_SCHEMES` here AND to `schemeConfig`/`ColorScheme` in `tokens.ts` AND to the regex in `index.html`

### Common Patterns

```tsx
// Creating a new context:
const MyContext = createContext<MyState | null>(null);
export function MyProvider({ children }: { children: ReactNode }) { ... }
export function useMyState() {
  const ctx = use(MyContext);
  if (!ctx) throw new Error("useMyState must be used within MyProvider");
  return ctx;
}
```

## Dependencies

### Internal

- `styles/tokens.ts` — `ColorScheme` type used by SchemeContext

<!-- MANUAL: -->
