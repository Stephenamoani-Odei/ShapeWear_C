import { ArrowUpRight, Ghost, MapPin, MessageCircle, Phone, ShieldCheck, Truck } from 'lucide-react';
import footerBackground from '@/assets/footer bg.jpg';
import { STORE, whatsappLink } from '@/lib/store-info';

const CONTACT_CHANNELS = [
  {
    name: 'WhatsApp',
    handle: 'Message us',
    badge: 'ORDER HELP',
    href: whatsappLink(),
    icon: MessageCircle,
  },
  {
    name: 'Call Us',
    handle: 'Tap to call',
    badge: 'SPEAK TO US',
    href: `tel:${STORE.phone}`,
    icon: Phone,
  },
  {
    name: 'Snapchat',
    handle: `@${STORE.snapchat}`,
    badge: 'FOLLOW',
    href: `https://www.snapchat.com/add/${STORE.snapchat}`,
    icon: Ghost,
  },
];

const NAVIGATION_LINKS = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Office Shirts', href: '/shop' },
    { label: 'Club Jerseys', href: '/shop' },
    { label: 'Country Jerseys', href: '/shop' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Sizing Help', href: '/contact' },
    { label: 'Delivery & Payment', href: '/contact' },
    { label: 'Returns & Exchanges', href: '/contact' },
    { label: 'About Us', href: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#070707] text-[#F5F0EB]">
      <img
        src={footerBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#070707]/80" aria-hidden="true" />

      {/* ── Wordmark Section ── */}
      <div className="relative z-10 border-b border-white/5 px-6 py-16 sm:py-20 lg:px-16 overflow-hidden">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-magenta-500 font-bold block mb-2">
              OFFICE SHIRTS &amp; JERSEYS // ACCRA, GHANA
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-white/40 max-w-sm">
            “DRESS SHARP. ORDER ONLINE.”
            <br />
            ONLINE CLOTHING STORE IN ACCRA, GHANA.
          </p>
        </div>
      </div>

      {/* ── Contact channels ── */}
      <div className="relative z-10 border-b border-white/10 px-6 py-14 lg:px-16 bg-[#0B0A2A]/75">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold block mb-1">
                QUESTIONS? WE ARE HERE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">CHAT WITH US</h3>
            </div>
            <span className="text-xs uppercase tracking-widest text-white/40 font-mono">ONLINE STORE // ACCRA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              const external = channel.href.startsWith('http');
              return (
                <a
                  key={channel.name}
                  href={channel.href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center justify-between border border-white/10 bg-[#15134A] p-4 transition-all duration-300 hover:border-magenta-600 hover:bg-[#1A1756] hover:shadow-[0_0_20px_rgba(184,21,95,0.25)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-navy-950 text-white/80 group-hover:border-magenta-600 group-hover:text-magenta-500 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-magenta-400 transition-colors">
                          {channel.name}
                        </span>
                        <span className="bg-magenta-600/20 text-magenta-500 px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest">
                          {channel.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40 font-mono block mt-0.5">{channel.handle}</span>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-white/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-magenta-500" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Links + Delivery & payment ── */}
      <div className="relative z-10 px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-magenta-600 rounded-full" />
                SHOP
              </h4>
              <ul className="space-y-3 text-xs uppercase tracking-wider text-white/60">
                {NAVIGATION_LINKS.shop.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.href} className="hover:text-magenta-500 transition-colors duration-200 block py-0.5">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-magenta-600 rounded-full" />
                HELP
              </h4>
              <ul className="space-y-3 text-xs uppercase tracking-wider text-white/60">
                {NAVIGATION_LINKS.support.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.href} className="hover:text-magenta-500 transition-colors duration-200 block py-0.5">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4 border border-white/10 bg-[#15134A]/90 p-6 sm:p-7">
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-4">PAYMENT &amp; DELIVERY</h4>
              <ul className="space-y-3.5 text-xs text-white/65 leading-relaxed">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <span>Pay securely online with Paystack, in Ghana cedis (GH₵).</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <span>Delivery price is confirmed by us after you place your order.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <span>Online store based in Accra, Ghana.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 border-t border-white/10 px-6 py-6 lg:px-16 bg-[#050505]/80">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30 font-mono">
          <p>&copy; {new Date().getFullYear()} SHAPEWEARFIT // ACCRA, GHANA. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <a href="/about" className="hover:text-white transition-colors">
              ABOUT
            </a>
            <span>•</span>
            <a href="/contact" className="hover:text-white transition-colors">
              CONTACT
            </a>
            <span>•</span>
            <a href="/shop" className="hover:text-white transition-colors">
              SHOP
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
