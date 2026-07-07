import {
  type ReactNode,
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import type { ColorScheme } from "../styles/tokens";

const STORAGE_KEY = "pignuante-scheme";
const VALID_SCHEMES = new Set<ColorScheme>([
  "aurora",
  "cotton",
  "matcha",
  "peach",
]);

interface SchemeState {
  scheme: ColorScheme;
  setScheme: (s: ColorScheme) => void;
}

const SchemeContext = createContext<SchemeState | null>(null);

function getInitialScheme(): ColorScheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return VALID_SCHEMES.has(stored as ColorScheme)
    ? (stored as ColorScheme)
    : "aurora";
}

export function SchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>(getInitialScheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-scheme", scheme);
    localStorage.setItem(STORAGE_KEY, scheme);
  }, [scheme]);

  const setScheme = useCallback((s: ColorScheme) => {
    setSchemeState(s);
  }, []);

  return (
    <SchemeContext value={{ scheme, setScheme }}>{children}</SchemeContext>
  );
}

export function useScheme(): SchemeState {
  const ctx = use(SchemeContext);
  if (!ctx) throw new Error("useScheme must be used within SchemeProvider");
  return ctx;
}
