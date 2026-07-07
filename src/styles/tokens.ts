/**
 * PignuAnte - Design Tokens (TypeScript)
 *
 * JS-accessible token values for use outside CSS context
 * (e.g., PixiJS canvas rendering, Motion animation configs).
 *
 * These MUST stay in sync with tokens.css.
 * Architecture: White-first semantics + 3 scheme-aware brand palettes.
 */

/* -- Color Scheme -------------------------------------------------------- */

export type ColorScheme = "aurora" | "cotton" | "matcha" | "peach";

export const schemeConfig: Record<
  ColorScheme,
  { accent: string; label: string; preview: string }
> = {
  aurora: {
    accent: "oklch(0.73 0.11 170)",
    label: "Aurora Dream",
    preview: "oklch(0.70 0.13 290)",
  },
  cotton: {
    accent: "oklch(0.73 0.10 230)",
    label: "Cotton Sky",
    preview: "oklch(0.71 0.13 350)",
  },
  matcha: {
    accent: "oklch(0.75 0.12 105)",
    label: "Matcha Garden",
    preview: "oklch(0.63 0.15 130)",
  },
  peach: {
    accent: "oklch(0.75 0.10 85)",
    label: "Peach Blossom",
    preview: "oklch(0.72 0.13 45)",
  },
};

/* -- Color Primitives (Aurora Dream default) ----------------------------- */

export const colors = {
  brand: {
    50: "oklch(0.96 0.03 290)",
    100: "oklch(0.92 0.05 290)",
    200: "oklch(0.86 0.08 290)",
    300: "oklch(0.78 0.11 290)",
    400: "oklch(0.70 0.13 290)",
    500: "oklch(0.62 0.15 290)",
    600: "oklch(0.54 0.13 290)",
    700: "oklch(0.44 0.11 290)",
    800: "oklch(0.36 0.09 290)",
    900: "oklch(0.28 0.07 290)",
  },
  neutral: {
    50: "oklch(0.98 0 0)",
    100: "oklch(0.93 0 0)",
    200: "oklch(0.87 0 0)",
    300: "oklch(0.71 0 0)",
    400: "oklch(0.55 0 0)",
    500: "oklch(0.45 0 0)",
    600: "oklch(0.37 0 0)",
    700: "oklch(0.27 0 0)",
    800: "oklch(0.2 0 0)",
    850: "oklch(0.16 0 0)",
    900: "oklch(0.13 0 0)",
    950: "oklch(0.07 0 0)",
  },
  semantic: {
    error: "oklch(0.72 0.14 25)",
    info: "oklch(0.72 0.10 240)",
    success: "oklch(0.75 0.14 152)",
    warning: "oklch(0.80 0.12 85)",
  },
} as const;

/**
 * Hex fallbacks for PixiJS (which doesn't support oklch).
 * Aurora Dream scheme values.
 */
export const pixiColors = {
  brand: {
    400: 0x9b7ecf,
    500: 0x7c5db8,
    600: 0x624a96,
  },
  neutral: {
    50: 0xf5f5f5,
    400: 0x808080,
    700: 0x3a3a3a,
    900: 0x1a1a1a,
    950: 0x0d0d0d,
  },
  semantic: {
    error: 0xd98070,
    info: 0x7aa0d0,
    success: 0x6bc490,
    warning: 0xccb860,
  },
} as const;

/* -- Typography: Pixel Fonts ------------------------------------------------ */

export const pixelFonts = {
  body: '"NeoDunggeunmo", monospace',
  heading: '"Press Start 2P", monospace',
} as const;

/* -- Motion -------------------------------------------------------------- */

export const easing = {
  apple: [0.42, 0, 0.58, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  snappy: [0.2, 0, 0, 1] as const,
};

export const duration = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
};

/* -- Pixel Shadows ------------------------------------------------------ */

export const pixelShadows = {
  lg: "6px 6px 0 0 oklch(0 0 0 / 0.12)",
  md: "4px 4px 0 0 oklch(0 0 0 / 0.12)",
  pressed: "2px 2px 0 0 oklch(0 0 0 / 0.12)",
  sm: "3px 3px 0 0 oklch(0 0 0 / 0.12)",
} as const;
