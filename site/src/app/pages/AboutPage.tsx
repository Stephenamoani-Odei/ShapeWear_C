import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Shirt, Ruler, Target, ArrowRight, MapPin, Phone } from 'lucide-react';
import aboutHeroBackground from '@/assets/about_hero_bg.jpg';
import aboutImage from '@/assets/polo-beige.jpg';
import { STORE, whatsappLink } from '@/lib/store-info';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '100%', label: 'ONLINE STORE', detail: 'Browse, order and pay from your phone or computer, any time.' },
  { value: '2', label: 'PRODUCT RANGES', detail: 'Long-sleeve office shirts, and club & country jerseys.' },
  { value: 'M–4XL', label: 'SHIRT SIZES', detail: 'Office shirts come in M to 4XL. Jerseys are available in S to XXL.' },
  { value: 'GH₵', label: 'PAYSTACK', detail: 'Prices in Ghana cedis, paid securely through Paystack.' },
];

const STEPS = [
  {
    phase: 'STEP 01',
    title: 'CHOOSE',
    desc: 'Browse our long-sleeve office shirts and jerseys, pick your size and add your favourites to the bag.',
  },
  {
    phase: 'STEP 02',
    title: 'CHECK OUT',
    desc: 'Fill in a short form with your contact and delivery details so we know where to bring your order.',
  },
  {
    phase: 'STEP 03',
    title: 'PAY WITH PAYSTACK',
    desc: 'Pay for your items securely on Paystack. We receive your order the moment you check out.',
  },
  {
    phase: 'STEP 04',
    title: 'WE DELIVER',
    desc: 'We contact you with the delivery price, agree a time with you, and deliver to your address.',
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0B0A2A] pt-24 sm:pt-28 pb-32 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="mx-auto max-w-[1440px]">
        {/* ── Page Hero ── */}
        <div
          ref={heroRef}
          className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden border-b border-white/10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14"
        >
          <img
            src={aboutHeroBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-[1] bg-[#0B0A2A]/75" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-[1440px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-magenta-600 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">
                ABOUT US // ACCRA, GHANA
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F0EB] max-w-5xl leading-[1.05]">
              SMART SHIRTS FOR WORK. <br />
              <span className="text-magenta-600">JERSEYS FOR FANS</span>
              <span className="text-stroke-white text-transparent">.</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-white/70 font-light max-w-2xl leading-relaxed">
              ShapeWearFit is an online clothing store based in Accra, Ghana. We sell long-sleeve shirts that meet office
              standard, and jerseys for club and country — and we bring them to your door.
            </p>
          </div>
        </div>

        {/* ── Key Facts ── */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, idx) => (
            <div key={idx} className="border border-white/10 bg-[#15134A] p-6 hover:border-magenta-600/40 transition-colors">
              <span className="block text-3xl sm:text-4xl font-black text-white font-mono">{s.value}</span>
              <span className="mt-2 block text-xs uppercase tracking-widest text-magenta-500 font-bold">{s.label}</span>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* ── Material Obsession ── */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/5] overflow-hidden bg-neutral-950 border border-white/10">
            <img
              src={aboutImage}
              alt="ShapeWearFit long-sleeve office shirt"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg font-bold uppercase text-white mt-1">LONG-SLEEVE SHIRTS · OFFICE STANDARD</p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-magenta-500" />
              <span className="text-xs uppercase tracking-[0.25em] text-magenta-500 font-bold">MATERIAL OBSESSION</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white leading-tight">
              CAREFULLY PICKED. OFFICE-STANDARD.
            </h2>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
              We choose every shirt and jersey we sell for how it looks, feels and lasts. Our long-sleeve shirts have the clean
              collars, button cuffs and neat finish you expect in an office, while our jerseys are light and breathable for
              matchday and everyday wear.
            </p>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
              Each item is shown exactly as it is, with the sizes available, so you can order online with confidence and
              get the right fit the first time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3">
                <Shirt className="h-5 w-5 text-magenta-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Office-Ready Finish</h4>
                  <p className="text-xs text-white/50 mt-1">Neat collars and button cuffs that look sharp from the first meeting to the last.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-magenta-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Easy Sizing</h4>
                  <p className="text-xs text-white/50 mt-1">
                    Not sure of your size?{' '}
                    <a href={whatsappLink('Hello ShapeWearFit, please help me choose a size.')} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                      Ask us on WhatsApp
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── How ordering works ── */}
        <div className="mt-28 border-t border-white/10 pt-16">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-magenta-500" />
            <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">ORDERING // FOUR SIMPLE STEPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            HOW ORDERING WORKS<span className="text-magenta-600">.</span>
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item, idx) => (
              <div key={idx} className="border border-white/10 bg-[#100E38] p-6 relative hover:border-magenta-600/50 transition-all">
                <span className="text-[10px] font-mono uppercase tracking-widest text-magenta-500 font-bold block mb-3">{item.phase}</span>
                <h3 className="text-base font-bold uppercase text-white tracking-wider mb-2">{item.title}</h3>
                <p className="text-xs leading-relaxed text-white/60 font-light">{item.desc}</p>
                <div className="absolute top-4 right-4 text-xs font-mono text-white/15">0{idx + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Where we are ── */}
        <div className="mt-28 border border-white/10 bg-[#15134A] p-8 sm:p-12">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-magenta-500" />
            <span className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold">WHERE WE ARE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">ONLINE STORE. BASED IN ACCRA.</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest text-magenta-500 font-bold">ACCRA, GHANA</span>
              <p className="text-xs text-white/60 mt-1">Our home base. Orders are prepared and sent out from Accra.</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-magenta-500 font-bold">ONLINE, ANY TIME</span>
              <p className="text-xs text-white/60 mt-1">Browse and order whenever suits you, from your phone or computer.</p>
            </div>
            <div>
              <a href={`tel:${STORE.phone}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-magenta-500 font-bold hover:text-magenta-400">
                <Phone className="h-3.5 w-3.5" />
                CALL US
              </a>
              <p className="text-xs text-white/60 mt-1">Questions about sizes or your order? Message or call us.</p>
            </div>
          </div>
        </div>

        {/* ── CTA to Shop ── */}
        <div className="mt-20 text-center py-12 border-t border-white/10">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mb-4">READY TO ORDER?</h3>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 bg-magenta-600 hover:bg-magenta-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(184,21,95,0.4)]"
          >
            <span>Shop the Collection</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
