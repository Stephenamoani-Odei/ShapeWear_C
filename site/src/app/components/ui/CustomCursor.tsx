import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine pointer and no reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer');
        setIsHovering(isInteractive);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const render = () => {
      // Smooth lerp for trailing ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[999] transition-opacity duration-300 hidden lg:block ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Center dot */}
      <div
        ref={dotRef}
        className={`fixed -left-1 -top-1 h-2 w-2 rounded-full bg-magenta-600 will-change-transform transition-[background-color] ${
          isHovering ? 'bg-white' : 'bg-magenta-600'
        }`}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className={`fixed -left-4 -top-4 rounded-full border border-magenta-600/50 will-change-transform transition-all duration-200 ease-out ${
          isHovering
            ? 'h-12 w-12 -left-6 -top-6 border-magenta-500 bg-magenta-600/10'
            : 'h-8 w-8'
        }`}
      />
    </div>
  );
}

