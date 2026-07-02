/** Shared navigation types and helpers */

export interface NavItem {
  label: string;
  path: string;
  /** Served outside the SPA (e.g. /history/) — render a plain <a> so the router doesn't intercept */
  external?: boolean;
}

/** Check if a nav path matches the current pathname (exact for "/", prefix for others) */
export function isActivePath(path: string, pathname: string): boolean {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}
