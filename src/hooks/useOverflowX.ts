import { type RefObject, useLayoutEffect, useState } from "react";

/** Whether the element's content is wider than its box, kept up to date. */
export function useOverflowX(ref: RefObject<HTMLElement | null>): boolean {
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // Content growth (a longer label) does not resize the scroller itself.
    for (const child of el.children) observer.observe(child);
    return () => observer.disconnect();
  }, [ref]);

  return overflows;
}
