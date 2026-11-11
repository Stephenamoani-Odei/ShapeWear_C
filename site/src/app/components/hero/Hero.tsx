import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import heroVideo from "@/assets/hero_video.mp4";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const contentBlockRef = useRef<HTMLDivElement>(null);
  const labelRightRef = useRef<HTMLSpanElement>(null);
  const headline1Ref = useRef<HTMLSpanElement>(null);
  const headline2Ref = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const cta1Ref = useRef<HTMLAnchorElement>(null);
  const cta2Ref = useRef<HTMLAnchorElement>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const targets = [
        labelRightRef.current,
        headline1Ref.current,
        headline2Ref.current,
        copyRef.current,
        cta1Ref.current,
        cta2Ref.current,
        scrollIndicatorRef.current,
      ];

      if (prefersReduced) {
        if (preloaderRef.current) gsap.set(preloaderRef.current, { display: 'none' });
        targets.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, y: 0 });
        });
        return;
      }

      targets.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, y: 20 });
      });

      const tl = gsap.timeline({
        delay: 0.15,
        defaults: { ease: 'power3.out' },
      });

      tl.to(preloaderRef.current, {
        yPercent: -100,
        duration: 0.65,
        ease: 'power4.inOut',
      });

      tl.to(labelRightRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      });

      tl.to(
        [headline1Ref.current, headline2Ref.current],
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
        '-=0.2'
      );

      tl.to(
        copyRef.current,
        { opacity: 1, y: 0, duration: 0.35 },
        '-=0.15'
      );

      tl.to(
        [cta1Ref.current, cta2Ref.current, scrollIndicatorRef.current],
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
        '-=0.15'
      );

      // Continuous Scroll-down Parallax Scrub as user scrolls down
      if (contentBlockRef.current) {
        gsap.to(contentBlockRef.current, {
          y: -80,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    },
    { scope: containerRef }
  );

  const handleScrollDown = () => {
    const target = document.querySelector('#shop') || document.querySelector('#manifesto');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[74vh] sm:min-h-[80vh] lg:min-h-[84vh] max-h-[880px] bg-[#0B0A2A] overflow-hidden flex flex-col justify-between pt-20 sm:pt-24"
    >
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div
        ref={preloaderRef}
        aria-hidden="true"
        className="absolute inset-0 z-30 hidden flex-col items-center justify-center gap-5 bg-[#0B0A2A] sm:flex"
      >
        <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#F5F0EB]">
          Shape<span className="text-magenta-500">Wear</span>Fit
        </span>
        <span className="h-px w-24 overflow-hidden bg-white/15">
          <span className="block h-full w-full origin-left animate-pulse bg-magenta-600" />
        </span>
      </div>

      {/* ── Content Container ── */}
      <div className="relative z-10 hidden w-full max-w-[1440px] mx-auto px-6 sm:flex sm:flex-1 sm:flex-col sm:justify-center sm:px-10 sm:py-6 lg:px-16">
        {/* Top labels - tight and compact below Navbar */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-white/5 pb-3">
          <span
            ref={labelRightRef}
            className="ml-auto text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/40 font-mono"
          >
            OFFICE SHIRTS • JERSEYS
          </span>
        </div>

        {/* Center-left content block */}
        <div ref={contentBlockRef} className="max-w-2xl">
          {/* Headline - perfectly proportioned and compact */}
          <h1 className="font-black uppercase tracking-tight leading-[1.0] mb-4 sm:mb-6">
            <span
              ref={headline1Ref}
              className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F5F0EB]"
            >
              OFFICE SHIRTS
            </span>
            <span
              ref={headline2Ref}
              className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F5F0EB]"
            >
              &amp; JERSEYS<span className="text-magenta-600">.</span>
            </span>
          </h1>

          {/* Supporting copy */}
          <p
            ref={copyRef}
            className="text-xs sm:text-sm lg:text-base text-white/70 max-w-md leading-relaxed mb-6 sm:mb-8 font-light"
          >
            Crisp long-sleeve shirts for the office and quality club & country jerseys. Order online from Accra and pay securely with Paystack.
          </p>

          {/* CTAs & Animated Scroll Down Indicator Row */}
          <div className="flex flex-wrap items-center justify-between gap-5 pt-1">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <a
                ref={cta1Ref}
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 bg-[#B8155F] hover:bg-magenta-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_25px_rgba(184,21,95,0.4)] hover:shadow-[0_0_35px_rgba(184,21,95,0.6)]"
              >
                <span>Shop Now</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                ref={cta2Ref}
                href="/about"
                className="inline-flex items-center justify-center border border-white/20 hover:border-magenta-600 hover:text-white bg-navy-950/40 backdrop-blur-sm text-white/90 px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                About Us
              </a>
            </div>

            {/* ── Prominent Animated Scroll Down Capsule Indicator ── */}
            <button
              ref={scrollIndicatorRef}
              onClick={handleScrollDown}
              className="group flex items-center gap-3 cursor-pointer py-1 text-white/50 hover:text-white transition-all text-left"
              aria-label="Scroll down to the collection"
            >
              <div className="relative flex h-10 w-5 items-start justify-center rounded-full border border-white/25 p-1 group-hover:border-magenta-600 transition-colors">
                <div className="h-2 w-1 rounded-full bg-magenta-600 animate-scroll-pill shadow-[0_0_8px_rgba(184,21,95,0.9)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-magenta-500 font-bold flex items-center gap-1">
                  SCROLL DOWN
                  <ChevronDown className="h-3 w-3 animate-bounce text-magenta-500" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/60 group-hover:text-white transition-colors">
                  BROWSE COLLECTION
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Sleek Slim Marquee Strip ── */}
      <div className="relative z-10 hidden w-full overflow-hidden border-y border-white/10 bg-[#0E0E0E]/90 py-2.5 backdrop-blur-sm sm:block">
        <div className="flex w-max animate-marquee space-x-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 font-mono">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-magenta-600 rounded-full" />
            LONG-SLEEVE OFFICE SHIRTS
          </span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>CLUB &amp; COUNTRY JERSEYS</span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>SECURE PAYMENT WITH PAYSTACK</span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>DELIVERY PRICE CONFIRMED AFTER YOU ORDER</span>
          <span className="text-magenta-500 font-bold">///</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-magenta-600 rounded-full" />
            LONG-SLEEVE OFFICE SHIRTS
          </span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>CLUB &amp; COUNTRY JERSEYS</span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>SECURE PAYMENT WITH PAYSTACK</span>
          <span className="text-magenta-500 font-bold">///</span>
          <span>DELIVERY PRICE CONFIRMED AFTER YOU ORDER</span>
          <span className="text-magenta-500 font-bold">///</span>
        </div>
      </div>
    </section>
  );
}
