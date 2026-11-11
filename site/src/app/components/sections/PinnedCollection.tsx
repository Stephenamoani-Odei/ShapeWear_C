import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import officeShirt from '@/assets/polo-pink.jpg';
import classicShirt from '@/assets/polo-beige.jpg';
import clubJersey from '@/assets/jersey-stripes.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function PinnedCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineLines = useRef<(HTMLSpanElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const lines = headlineLines.current.filter(Boolean);
      const imageCards = cards.current.filter(Boolean);

      gsap.set(lines, { yPercent: 110 });
      gsap.set(imageCards, {
        opacity: 0,
        y: 80,
        scale: 0.88,
        rotateX: 12,
        rotateY: -8,
        transformPerspective: 1000,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          pin: stageRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(lines, {
          yPercent: 0,
          duration: 0.85,
          stagger: 0.16,
          ease: 'power3.out',
        })
        .to(
          imageCards,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 1,
            stagger: 0.14,
            ease: 'power2.out',
          },
          '-=0.25'
        )
        .to(imageCards[0], { y: -14, rotateZ: -2, duration: 0.75, ease: 'none' })
        .to(imageCards[1], { y: 15, rotateZ: 3, duration: 0.75, ease: 'none' }, '<')
        .to(imageCards[2], { y: -8, rotateZ: 1.5, duration: 0.75, ease: 'none' }, '<');
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-[#11102F] text-[#F5F0EB]">
      <div
        ref={stageRef}
        className="relative isolate grid h-[100svh] min-h-[760px] max-h-[950px] grid-cols-1 items-center gap-5 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:gap-10 lg:px-16"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_48%,rgba(184,21,95,0.16),transparent_48%)]" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-magenta-400">
              THE SHAPEWEARFIT EDIT // ACCRA
            </p>
            <h2 className="font-black uppercase leading-[0.98] text-[#F5F0EB]">
              <span className="block overflow-hidden">
                <span ref={(element) => { headlineLines.current[0] = element; }} className="block text-4xl sm:text-6xl lg:text-7xl">
                  MADE FOR
                </span>
              </span>
              <span className="block overflow-hidden">
                <span ref={(element) => { headlineLines.current[1] = element; }} className="block text-4xl sm:text-6xl lg:text-7xl">
                  MONDAY TO
                </span>
              </span>
              <span className="block overflow-hidden text-magenta-400">
                <span ref={(element) => { headlineLines.current[2] = element; }} className="block text-4xl sm:text-6xl lg:text-7xl">
                  MATCHDAY.
                </span>
              </span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
              Clean lines for the workweek. Club colours for the weekend. Find your next favourite in the collection.
            </p>
            <a
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 border-b border-magenta-500 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-magenta-300"
            >
              Explore the collection
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative mt-3 h-[34vh] min-h-[280px] max-h-[420px] [perspective:1200px] lg:mt-0 lg:h-[62vh] lg:min-h-[480px]">
            <div
              ref={(element) => { cards.current[0] = element; }}
              className="absolute left-[5%] top-[8%] z-10 h-[82%] w-[53%] overflow-hidden border border-white/15 bg-[#1C1958] shadow-2xl"
            >
              <img src={officeShirt} alt="Salmon pink long-sleeve office shirt" className="h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 bg-[#0B0A2A]/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                OFFICE / 01
              </span>
            </div>
            <div
              ref={(element) => { cards.current[1] = element; }}
              className="absolute right-[3%] top-0 z-20 h-[47%] w-[44%] overflow-hidden border border-white/15 bg-[#1C1958] shadow-2xl"
            >
              <img src={clubJersey} alt="Red and blue striped club jersey" className="h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 bg-[#0B0A2A]/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                CLUB / 02
              </span>
            </div>
            <div
              ref={(element) => { cards.current[2] = element; }}
              className="absolute bottom-0 right-[3%] z-20 h-[44%] w-[43%] overflow-hidden border border-white/15 bg-[#1C1958] shadow-2xl"
            >
              <img src={classicShirt} alt="Beige long-sleeve office shirt" className="h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 bg-[#0B0A2A]/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                ESSENTIAL / 03
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}