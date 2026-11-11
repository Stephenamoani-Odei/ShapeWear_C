import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { STORE, whatsappLink } from '../../../lib/store-info';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop All', href: '/shop' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

const socialLinks = [
  { label: 'WhatsApp', href: whatsappLink() },
  { label: 'Call us', href: `tel:${STORE.phone}` },
  { label: 'Snapchat', href: `https://www.snapchat.com/add/${STORE.snapchat}` },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.set(containerRef.current, { display: 'none', opacity: 0, xPercent: 100 });
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onReverseComplete: () => {
          if (containerRef.current) gsap.set(containerRef.current, { display: 'none' });
        },
      });

      tl.to(containerRef.current, { opacity: 1, xPercent: 0, duration: 0.5 })
        .fromTo(
          closeRef.current,
          { opacity: 0, rotate: -90 },
          { opacity: 1, rotate: 0, duration: 0.4 },
          '-=0.2'
        )
        .fromTo(
          linksRef.current.filter(Boolean),
          { opacity: 0, x: 60, skewX: -5 },
          { opacity: 1, x: 0, skewX: 0, duration: 0.5, stagger: 0.08 },
          '-=0.3'
        )
        .fromTo(
          socialRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.2'
        );

      tlRef.current = tl;
      return () => tl.kill();
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (!containerRef.current || !tlRef.current) return;

    if (isOpen) {
      gsap.set(containerRef.current, { display: 'flex' });
      tlRef.current.play();
    } else {
      tlRef.current.reverse();
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      id="mobile-navigation-menu"
      data-lenis-prevent
      className="fixed inset-0 z-[100] hidden flex-col bg-[#0B0A2A]"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Close Button */}
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center text-[#F5F0EB]/70 transition-colors duration-300 hover:text-[#F5F0EB]"
        aria-label="Close menu"
      >
        <X className="h-7 w-7" strokeWidth={1.5} />
      </button>

      {/* Main Navigation Links */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-12">
        <nav className="flex flex-col gap-4 sm:gap-6">
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              ref={(el) => {
                linksRef.current[index] = el;
              }}
              href={link.href}
              onClick={onClose}
              className="group relative inline-block w-fit text-4xl font-light uppercase tracking-[0.08em] text-[#F5F0EB] transition-colors duration-300 hover:text-[#B8155F] sm:text-5xl"
            >
              <span className="relative">
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#B8155F] transition-all duration-500 group-hover:w-full" />
              </span>
            </a>
          ))}
        </nav>
      </div>

      {/* Social Links */}
      <div ref={socialRef} className="border-t border-[#F5F0EB]/10 px-8 py-8 sm:px-12">
        <div className="flex flex-wrap items-center gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.2em] text-[#F5F0EB]/50 transition-colors duration-300 hover:text-[#F5F0EB]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export { MobileMenu };
