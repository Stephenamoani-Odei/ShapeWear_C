// ─────────────────────────────────────────────────────────────
// ShapeWearFit — GSAP ScrollTrigger Animation Hook
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// ── Types ──────────────────────────────────────────────────

export interface ScrollAnimationConfig {
  /** GSAP "from" vars — the initial state before animating in */
  from?: gsap.TweenVars;
  /** GSAP "to" vars — the final animated state */
  to?: gsap.TweenVars;
  /** ScrollTrigger-specific overrides */
  trigger?: ScrollTrigger.Vars;
  /** If true, run a simple `gsap.to` instead of `gsap.fromTo` */
  toOnly?: boolean;
  /** Duration in seconds (default 1) */
  duration?: number;
  /** Ease function (default 'power3.out') */
  ease?: string;
  /** Delay in seconds (default 0) */
  delay?: number;
  /** Target child selector — animate children instead of the ref element */
  childSelector?: string;
  /** Stagger value when animating multiple children */
  stagger?: number | gsap.StaggerVars;
}

export interface ScrollAnimationState {
  /** Whether the element has entered the viewport at least once */
  hasEntered: boolean;
  /** Whether the element is currently visible in the viewport */
  isVisible: boolean;
  /** The scroll progress 0–1 (only meaningful with scrub triggers) */
  progress: number;
}

// ── Default animation presets ──────────────────────────────

const DEFAULT_FROM: gsap.TweenVars = {
  opacity: 0,
  y: 60,
};

const DEFAULT_TO: gsap.TweenVars = {
  opacity: 1,
  y: 0,
};

const DEFAULT_TRIGGER: ScrollTrigger.Vars = {
  start: 'top 85%',
  end: 'bottom 20%',
  toggleActions: 'play none none none',
};

// ── Hook ───────────────────────────────────────────────────

/**
 * Attaches a GSAP ScrollTrigger animation to the given ref.
 *
 * @param ref — React ref to the DOM element (or parent element when using childSelector)
 * @param config — Animation configuration
 * @returns Animation state (hasEntered, isVisible, progress)
 *
 * @example
 * ```tsx
 * const sectionRef = useRef<HTMLDivElement>(null);
 * const { hasEntered } = useScrollAnimation(sectionRef, {
 *   from: { opacity: 0, y: 80 },
 *   to: { opacity: 1, y: 0 },
 *   duration: 0.8,
 * });
 * return <section ref={sectionRef}>…</section>;
 * ```
 */
export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  config: ScrollAnimationConfig = {}
): ScrollAnimationState {
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<ScrollAnimationState>({
    hasEntered: false,
    isVisible: false,
    progress: 0,
  });

  // Keep a stable ref to config to avoid re-running effect on every render
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      from = DEFAULT_FROM,
      to = DEFAULT_TO,
      trigger: triggerVars = {},
      toOnly = false,
      duration = 1,
      ease = 'power3.out',
      delay = 0,
      childSelector,
      stagger,
    } = configRef.current;

    // ── Reduced motion: skip animation, just show the final state ──
    if (prefersReducedMotion) {
      const targets = childSelector ? el.querySelectorAll(childSelector) : el;
      gsap.set(targets, { ...to, opacity: 1 });
      setState({ hasEntered: true, isVisible: true, progress: 1 });
      return;
    }

    // ── Build ScrollTrigger vars ──
    const scrollTriggerVars: ScrollTrigger.Vars = {
      ...DEFAULT_TRIGGER,
      ...triggerVars,
      trigger: el,
      onEnter: () => setState((s) => ({ ...s, hasEntered: true, isVisible: true })),
      onLeave: () => setState((s) => ({ ...s, isVisible: false })),
      onEnterBack: () => setState((s) => ({ ...s, isVisible: true })),
      onLeaveBack: () => setState((s) => ({ ...s, isVisible: false })),
      onUpdate: (self) => setState((s) => ({ ...s, progress: self.progress })),
    };

    // ── Determine animation targets ──
    const targets = childSelector ? el.querySelectorAll(childSelector) : el;

    // ── Create the tween ──
    let tween: gsap.core.Tween;

    const sharedVars: gsap.TweenVars = {
      duration,
      ease,
      delay,
      scrollTrigger: scrollTriggerVars,
      ...(stagger !== undefined && { stagger }),
    };

    if (toOnly) {
      tween = gsap.to(targets, { ...to, ...sharedVars });
    } else {
      tween = gsap.fromTo(targets, { ...from }, { ...to, ...sharedVars });
    }

    // ── Cleanup ──
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, prefersReducedMotion]);

  return state;
}

// ── Preset factories ───────────────────────────────────────

/** Fade up from below */
export function fadeUp(overrides?: Partial<ScrollAnimationConfig>): ScrollAnimationConfig {
  return {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
    duration: 0.9,
    ease: 'power3.out',
    ...overrides,
  };
}

/** Fade in from the left */
export function fadeLeft(overrides?: Partial<ScrollAnimationConfig>): ScrollAnimationConfig {
  return {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0 },
    duration: 0.9,
    ease: 'power3.out',
    ...overrides,
  };
}

/** Fade in from the right */
export function fadeRight(overrides?: Partial<ScrollAnimationConfig>): ScrollAnimationConfig {
  return {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0 },
    duration: 0.9,
    ease: 'power3.out',
    ...overrides,
  };
}

/** Scale up from smaller */
export function scaleUp(overrides?: Partial<ScrollAnimationConfig>): ScrollAnimationConfig {
  return {
    from: { opacity: 0, scale: 0.85 },
    to: { opacity: 1, scale: 1 },
    duration: 0.8,
    ease: 'back.out(1.4)',
    ...overrides,
  };
}

/** Staggered children reveal */
export function staggerChildren(
  childSelector: string,
  overrides?: Partial<ScrollAnimationConfig>
): ScrollAnimationConfig {
  return {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    duration: 0.7,
    ease: 'power2.out',
    childSelector,
    stagger: 0.1,
    ...overrides,
  };
}

/** Parallax scroll effect */
export function parallax(
  yPercent: number = -20,
  overrides?: Partial<ScrollAnimationConfig>
): ScrollAnimationConfig {
  return {
    toOnly: true,
    to: { yPercent },
    ease: 'none',
    trigger: {
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
    ...overrides,
  };
}

export default useScrollAnimation;
