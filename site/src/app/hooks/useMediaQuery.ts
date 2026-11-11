// ─────────────────────────────────────────────────────────────
// ShapeWearFit — Responsive Media Query Hook
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// ── Core hook ──────────────────────────────────────────────

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 *
 * Uses `useSyncExternalStore` for concurrent-mode safety where available,
 * with a `useState`/`useEffect` fallback for broader compatibility.
 *
 * @param query  A valid CSS media query string, e.g. `"(min-width: 768px)"`
 * @returns `true` if the query matches, `false` otherwise
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // SSR guard — always false on the server
  const getServerSnapshot = useCallback(() => false, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Prefer useSyncExternalStore when available (React 18+)
  if (typeof useSyncExternalStore === 'function') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  // Fallback for older React versions
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQueryLegacy(query);
}

/** Legacy implementation for React < 18 */
function useMediaQueryLegacy(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Sync initial value
    setMatches(mql.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ── Preset breakpoint hooks ────────────────────────────────
// Tailwind CSS default breakpoints

/** ≥ 640px (Tailwind `sm`) */
export function useIsSm(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

/** ≥ 768px (Tailwind `md`) */
export function useIsMd(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/** ≥ 1024px (Tailwind `lg`) */
export function useIsLg(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/** ≥ 1280px (Tailwind `xl`) */
export function useIsXl(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/** ≥ 1536px (Tailwind `2xl`) */
export function useIs2xl(): boolean {
  return useMediaQuery('(min-width: 1536px)');
}

/** True when the viewport is portrait-oriented */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

/** True when the user's device supports hover (mouse, not touch) */
export function useCanHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/** True when the device is a touch-primary device (coarse pointer) */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/** Current breakpoint label based on Tailwind defaults */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useBreakpoint(): Breakpoint {
  const is2xl = useIs2xl();
  const isXl = useIsXl();
  const isLg = useIsLg();
  const isMd = useIsMd();
  const isSm = useIsSm();

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

export default useMediaQuery;
