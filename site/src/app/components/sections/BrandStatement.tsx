import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BrandStatement() {
  const containerRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Opposing kinetic scroll scrub
      gsap.fromTo(
        line1Ref.current,
        { x: -60, opacity: 0.7 },
        {
          x: 40,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );

      gsap.fromTo(
        line2Ref.current,
        { x: 60, opacity: 0.7 },
        {
          x: -40,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );

      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="manifesto"
      className="relative overflow-hidden bg-[#0B0A2A] py-24 sm:py-36 px-6 sm:px-10 lg:px-16 border-t border-white/5"
    >
      {/* Background kinetic watermarks */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 select-none opacity-[0.03] pointer-events-none font-black text-[16vw] leading-none tracking-tighter uppercase whitespace-nowrap text-white">
        SHAPEWEARFIT SHAPEWEARFIT
      </div>

      <div className="mx-auto max-w-[1440px] relative z-10">
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <Flame className="h-4 w-4 text-magenta-500 animate-pulse" />
          <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">
            WHY SHOP WITH US
          </span>
        </div>

        {/* Massive Editorial Headline - kinetic scrub motion */}
        <div className="space-y-1 sm:space-y-3">
          <h2
            ref={line1Ref}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F0EB] leading-[1.05] break-words"
          >
            DRESS <span className="text-stroke-white text-transparent">SHARP.</span>
          </h2>
          <h2
            ref={line2Ref}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-magenta-600 break-words"
          >
            ORDER ONLINE<span className="text-[#F5F0EB]">.</span>
          </h2>
        </div>

        {/* Narrative Grid */}
        <div
          ref={cardRef}
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-white/10 pt-10"
        >
          <div className="md:col-span-5">
            <p className="text-lg sm:text-xl lg:text-2xl font-light text-[#F5F0EB] leading-relaxed">
              ShapeWearFit is an online clothing store in Accra, Ghana. We sell long-sleeve shirts that meet office standard, and jerseys for the fans — ordered online, paid securely and delivered to you.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs uppercase tracking-wider text-white/60">
            <div className="border-l-2 border-magenta-600/70 pl-4 py-1">
              <span className="block font-black text-2xl text-white mb-1 font-mono">9–5</span>
              <span className="text-[10px] text-white/40 tracking-widest block">Office Standard</span>
              <p className="mt-2 normal-case tracking-normal text-white/70 text-xs leading-relaxed">
                Long-sleeve shirts with a clean, professional finish for work, meetings and church.
              </p>
            </div>

            <div className="border-l-2 border-magenta-600/70 pl-4 py-1">
              <span className="block font-black text-2xl text-white mb-1 font-mono">S–XXL</span>
              <span className="text-[10px] text-white/40 tracking-widest block">Jersey Sizes</span>
              <p className="mt-2 normal-case tracking-normal text-white/70 text-xs leading-relaxed">
                Pick your size and add to bag. Jerseys come in sizes S to XXL.
              </p>
            </div>

            <div className="border-l-2 border-magenta-600/70 pl-4 py-1">
              <span className="block font-black text-2xl text-white mb-1 font-mono">GH₵</span>
              <span className="text-[10px] text-white/40 tracking-widest block">Paystack Checkout</span>
              <p className="mt-2 normal-case tracking-normal text-white/70 text-xs leading-relaxed">
                Prices in Ghana cedis. Pay online through Paystack&apos;s secure checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
