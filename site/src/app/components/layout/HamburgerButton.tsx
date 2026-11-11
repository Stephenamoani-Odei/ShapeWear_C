import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);
  const menuLabelRef = useRef<HTMLSpanElement>(null);
  const closeLabelRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        topLineRef.current,
        { rotate: isOpen ? 0 : 45, y: isOpen ? 0 : 4 },
        { rotate: isOpen ? 45 : 0, y: isOpen ? 4 : 0, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        bottomLineRef.current,
        { rotate: isOpen ? 0 : -45, y: isOpen ? 0 : -4 },
        { rotate: isOpen ? -45 : 0, y: isOpen ? -4 : 0, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        menuLabelRef.current,
        { yPercent: isOpen ? 0 : -120, autoAlpha: isOpen ? 1 : 0 },
        {
          yPercent: isOpen ? -120 : 0,
          autoAlpha: isOpen ? 0 : 1,
          duration: 0.22,
          ease: 'power2.out',
        }
      );
      gsap.fromTo(
        closeLabelRef.current,
        { yPercent: isOpen ? 120 : 0, autoAlpha: isOpen ? 0 : 1 },
        {
          yPercent: isOpen ? 0 : 120,
          autoAlpha: isOpen ? 1 : 0,
          duration: 0.22,
          ease: 'power2.out',
        }
      );
    },
    { dependencies: [isOpen], scope: buttonRef, revertOnUpdate: true }
  );

  const handleMouseEnter = () => {
    gsap.to([topLineRef.current, bottomLineRef.current], {
      scaleX: 0.85,
      x: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to([topLineRef.current, bottomLineRef.current], {
      scaleX: 1,
      x: 0,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative z-10 inline-flex h-10 items-center gap-2.5 rounded-full bg-[#F5F0EB] px-3.5 text-[#0B0A2A] transition-colors duration-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta-500 lg:hidden"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <span className="relative block h-3 w-5" aria-hidden="true">
        <span
          ref={topLineRef}
          className="absolute left-0 top-[2px] block h-px w-5 origin-center bg-current"
        />
        <span
          ref={bottomLineRef}
          className="absolute left-0 top-[9px] block h-px w-5 origin-center bg-current"
        />
      </span>
      <span className="relative h-3.5 w-10 overflow-hidden text-[10px] font-bold tracking-[0.16em]">
        <span ref={menuLabelRef} className="absolute inset-0">
          MENU
        </span>
        <span ref={closeLabelRef} className="absolute inset-0">
          CLOSE
        </span>
      </span>
    </button>
  );
}

export { HamburgerButton };
