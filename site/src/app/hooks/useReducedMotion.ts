// ─────────────────────────────────────────────────────────────
// ShapeWearFit — Reduced Motion Preference Hook
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Detects whether the user has requested reduced motion via their
 * operating system accessibility settings.
 *
 * Returns `true` when `prefers-reduced-motion: reduce` is active.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * useEffect(() => {
 *   if (prefersReducedMotion) return; // skip animation
 *   gsap.to(ref.current, { opacity: 1, y: 0 });
 * }, [prefersReducedMotion]);
 * ```
 */
export function useReducedMotion(): boolean {
  const getServerSnapshot = useCallback(() => false, []);

  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  }, []);

  // Prefer useSyncExternalStore (React 18+)
  if (typeof useSyncExternalStore === 'function') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  // Fallback for React < 18
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useReducedMotionLegacy();
}

/** Legacy implementation for React < 18 */
function useReducedMotionLegacy(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);

    // Sync initial value
    setPrefersReduced(mql.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export default useReducedMotion;
