import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shirt, Trophy, Flag, ShieldCheck } from 'lucide-react';
import storyImage from '@/assets/polo-pink.jpg';
import { STORE, whatsappLink } from '@/lib/store-info';

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    icon: Shirt,
    title: 'OFFICE-STANDARD SHIRTS',
    desc: 'Long-sleeve shirts with neat collars and button cuffs for work, meetings and church.',
  },
  {
    icon: Trophy,
    title: 'CLUB JERSEYS',
    desc: 'Home and away jerseys, light and breathable, in sizes S to XXL.',
  },
  {
    icon: Flag,
    title: 'COUNTRY JERSEYS',
    desc: 'Back your national team on matchday with a quality country jersey.',
  },
  {
    icon: ShieldCheck,
    title: 'SECURE CHECKOUT',
    desc: 'Pay online with Paystack. We contact you with the delivery price after you order.',
  },
];

export default function BrandStory() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const atelierImgRef = useRef<HTMLDivElement>(null);
  const atelierTextRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (atelierImgRef.current) {
        gsap.fromTo(
          atelierImgRef.current,
          { opacity: 0, x: -50, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: atelierImgRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (atelierTextRef.current) {
        gsap.fromTo(
          atelierTextRef.current,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            delay: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: atelierImgRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 45, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
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
      id="our-story"
      className="relative bg-[#0B0A2A] py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-b border-white/10"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Editorial Brand Intro */}
        <div ref={headlineRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-20">
          <div className="lg:col-span-8">
            <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold block mb-4">
              SHAPEWEARFIT // ACCRA, GHANA
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight text-[#F5F0EB] leading-[1.05]">
              QUALITY YOU <br />
              <span className="text-magenta-600">CAN FEEL</span>
              <span className="text-stroke-white text-transparent">.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 border-l-2 border-magenta-600 pl-6">
            <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed">
              &ldquo;An online clothing store in Accra for office-standard long-sleeve shirts and jerseys.&rdquo;
            </p>
            <span className="mt-4 block text-xs uppercase tracking-widest text-magenta-500 font-mono">
              WHATSAPP OR CALL US
            </span>
          </div>
        </div>

        {/* Dual Visual + Narrative Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-24">
          <div ref={atelierImgRef} className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-neutral-950 border border-white/10">
            <img
              src={storyImage}
              alt="ShapeWearFit long-sleeve office shirt"
              className="h-full w-full object-cover filter contrast-125 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] uppercase tracking-widest text-magenta-500 font-bold">
                OFFICE SHIRTS
              </span>
              <p className="text-lg font-bold uppercase text-white mt-1">
                LONG-SLEEVE · OFFICE STANDARD
              </p>
            </div>
          </div>

          <div ref={atelierTextRef} className="lg:col-span-6 flex flex-col justify-between border border-white/10 bg-[#15134A] p-8 sm:p-12">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-bold">
                HOW TO ORDER
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-snug">
                SMART SHIRTS FOR WORK. JERSEYS FOR EVERY FAN.
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                Choose your size, add to bag and check out. Fill in your delivery details and pay securely with Paystack.
              </p>
              <p className="text-sm leading-relaxed text-white/70">
                After you order, we contact you with the delivery price and arrange delivery. Questions? Message us on WhatsApp or call us.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp us</a>
              <span className="text-magenta-500 font-bold">///</span>
              <span>Snapchat @{STORE.snapchat}</span>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div>
          <div className="border-b border-white/10 pb-4 mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-semibold">
              WHAT YOU GET
            </span>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="group border border-white/10 bg-[#100E38] p-6 hover:border-magenta-600/50 hover:bg-[#17154E] transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-none border border-white/15 bg-navy-950 text-magenta-500 group-hover:border-magenta-600 group-hover:bg-magenta-600 group-hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-white">
                    {p.title}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
