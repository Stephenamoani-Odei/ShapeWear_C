import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import heroImage from '@/assets/polo-beige.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function Campaign() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Parallax image scrub on scroll
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.2, y: -45 },
          {
            scale: 1,
            y: 35,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          }
        );
      }

      // Content reveal on scroll down into section
      const contentElements = [badgeRef.current, headlineRef.current, copyRef.current, ctasRef.current];
      gsap.fromTo(
        contentElements,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[75vh] sm:min-h-[85vh] w-full overflow-hidden bg-navy-950 flex items-center justify-center border-y border-white/10"
    >
      {/* Background Parallax Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imageRef}
          src={heroImage}
          alt="ShapeWearFit long-sleeve office shirt"
          className="h-[120%] w-full object-cover object-center filter brightness-60 contrast-125"
        />
        {/* Dark Vignettes & Crimson ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A2A] via-transparent to-[#0B0A2A]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0A2A]/80 via-transparent to-[#0B0A2A]/80" />
        <div className="absolute inset-0 bg-magenta-950/20 mix-blend-color" />
      </div>

      {/* Editorial Content */}
      <div className="relative z-10 w-full max-w-[1440px] px-6 sm:px-10 lg:px-16 py-24 sm:py-32 text-center flex flex-col items-center">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 border border-magenta-600/40 bg-navy-950/70 px-4 py-1.5 backdrop-blur-md mb-6 sm:mb-8"
        >
          <span className="h-2 w-2 rounded-full bg-magenta-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">
            ORDER ONLINE
          </span>
        </div>

        <h2
          ref={headlineRef}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F0EB] max-w-5xl leading-[1.05] break-words"
        >
          SHARP AT <span className="text-magenta-600">WORK.</span>
          <br />
          READY FOR <span className="text-stroke-white text-transparent">MATCHDAY.</span>
        </h2>

        <p
          ref={copyRef}
          className="mt-6 sm:mt-8 max-w-xl text-sm sm:text-base lg:text-lg text-white/70 font-light leading-relaxed"
        >
          Long-sleeve shirts for the office and jerseys for the weekend — all from one online store in Accra.
        </p>

        <div ref={ctasRef} className="mt-8 sm:mt-10 flex flex-wrap gap-4 justify-center">
          <a
            href="/about"
            className="inline-flex items-center gap-2 bg-magenta-600 hover:bg-magenta-700 text-white px-7 sm:px-9 py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(184,21,95,0.4)]"
          >
            <span>About Us</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 border border-white/20 hover:border-white text-white px-7 sm:px-9 py-4 text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-all"
          >
            <span>Shop Now</span>
          </a>
        </div>
      </div>
    </section>
  );
}
