import type { Dispatch, RefCallback, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMenuNavigationReturn {
  registerLinkRef: (index: number) => RefCallback<HTMLElement>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useMenuNavigation(menuLength: number): UseMenuNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const hasKeyNavigated = useRef<boolean>(false);
  const linkRefs = useRef<(HTMLElement | null)[]>([]);
  const selectedIndexRef = useRef<number>(selectedIndex);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const getFocusedLinkIndex = useCallback((): number => {
    const activeElement = document.activeElement;

    return linkRefs.current.findIndex(
      (linkElement) => linkElement === activeElement,
    );
  }, []);

  const isEditableTarget = useCallback(
    (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      if (target.isContentEditable) {
        return true;
      }

      return ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
    },
    [],
  );

  const registerLinkRef = useCallback(
    (index: number): RefCallback<HTMLElement> => {
      return (element: HTMLElement | null): void => {
        linkRefs.current[index] = element;
      };
    },
    [],
  );

  useEffect(() => {
    if (menuLength === 0) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const isArrow = event.key === "ArrowDown" || event.key === "ArrowUp";
      if (!isArrow && event.key !== "Enter") {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const focusedIndex = getFocusedLinkIndex();
      // Nothing focused yet (fresh page load): the visible ▸ cursor stands in
      // for focus, so arrows move it and Enter follows it — without stealing
      // focus on load. Focus anywhere else (navbar, dialog) is left alone.
      const isIdle =
        document.activeElement === null ||
        document.activeElement === document.body;

      if (focusedIndex < 0 && !isIdle) {
        return;
      }

      if (event.key === "Enter") {
        // A focused link already handles Enter natively.
        if (focusedIndex >= 0) return;
        event.preventDefault();
        linkRefs.current[selectedIndexRef.current]?.click();
        return;
      }

      event.preventDefault();
      hasKeyNavigated.current = true;
      const fromIndex = focusedIndex >= 0 ? focusedIndex : null;

      setSelectedIndex((current) => {
        const base = fromIndex ?? current;
        return event.key === "ArrowDown"
          ? (base + 1) % menuLength
          : (base - 1 + menuLength) % menuLength;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getFocusedLinkIndex, isEditableTarget, menuLength]);

  useEffect(() => {
    if (hasKeyNavigated.current) {
      linkRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  return { registerLinkRef, selectedIndex, setSelectedIndex };
}
