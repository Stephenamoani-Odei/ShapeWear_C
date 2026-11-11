import { useState, type FormEvent } from 'react';
import { MessageCircle, Phone, MapPin, Send, AlertCircle, ChevronDown, ChevronUp, Truck, CreditCard } from 'lucide-react';
import { STORE, whatsappLink } from '@/lib/store-info';

const TOPICS = ['Help choosing a size', 'Question about my order', 'Delivery question', 'Something else'] as const;

const FAQS = [
  {
    q: 'HOW DO I CHOOSE MY SIZE?',
    a: 'Jerseys come in sizes S to XXL and our office shirts in M to 4XL. Choose your usual size, or message us on WhatsApp and we will help you pick the right fit.',
  },
  {
    q: 'HOW DO I PAY?',
    a: 'At checkout you fill in your contact and delivery details, then pay securely on Paystack. Prices are in Ghana cedis (GH₵).',
  },
  {
    q: 'HOW MUCH IS DELIVERY?',
    a: 'We deliver from Accra. The delivery price is not charged at checkout — after you place your order, we contact you on the phone number you gave us to agree the delivery price and arrange delivery.',
  },
  {
    q: 'WHAT HAPPENS AFTER I ORDER?',
    a: 'You will see an order confirmation with your order reference, and Paystack emails you a receipt. We receive your order straight away and get in touch with you about delivery.',
  },
  {
    q: 'WHAT IF MY SIZE DOES NOT FIT?',
    a: 'We offer 14-day returns on unworn items in their original packaging. Size exchanges depend on stock availability. Message us on WhatsApp and we will sort it out.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', topic: TOPICS[0] as string, orderRef: '', message: '' });
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please fill in your name and your message.');
      return;
    }
    setError('');
    const lines = [
      `Hello ShapeWearFit, my name is ${form.name.trim()}.`,
      `Topic: ${form.topic}`,
      form.orderRef.trim() ? `Order reference: ${form.orderRef.trim()}` : '',
      form.phone.trim() ? `My phone number: ${form.phone.trim()}` : '',
      '',
      form.message.trim(),
    ].filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== ''));
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  const field =
    'w-full bg-[#0B0A2A] border border-white/15 px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-magenta-600 focus:outline-none transition-colors';
  const label = 'block text-xs uppercase tracking-wider text-white/60 mb-2';

  return (
    <div className="min-h-screen bg-[#0B0A2A] pt-24 sm:pt-28 pb-32 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* ── Page Header ── */}
        <div className="border-b border-white/10 pb-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-magenta-600 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">CUSTOMER SUPPORT // ACCRA, GHANA</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F0EB]">
            GET IN TOUCH<span className="text-magenta-600">.</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-white/60 font-light max-w-xl">
            Questions about sizes, your order or delivery? Send us a message and we will reply on WhatsApp.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ── Message form (sends via WhatsApp) ── */}
          <div className="lg:col-span-7 border border-white/10 bg-[#15134A] p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">SEND US A MESSAGE</h2>
              <span className="text-[10px] uppercase tracking-widest text-magenta-500 font-mono">VIA WHATSAPP</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="c-name" className={label}>Full Name <span className="text-magenta-500">*</span></label>
                  <input id="c-name" type="text" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ama Mensah" className={field} />
                </div>
                <div>
                  <label htmlFor="c-phone" className={label}>Phone Number</label>
                  <input id="c-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 024 412 3456" className={field} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="c-topic" className={label}>Topic</label>
                  <select id="c-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={field}>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-order" className={label}>Order Reference (Optional)</label>
                  <input id="c-order" type="text" value={form.orderRef} onChange={(e) => setForm({ ...form, orderRef: e.target.value })} placeholder="SWF-XXXXXXXXXX" className={`${field} uppercase font-mono`} />
                </div>
              </div>

              <div>
                <label htmlFor="c-message" className={label}>Message <span className="text-magenta-500">*</span></label>
                <textarea id="c-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us which shirt or jersey you are asking about, your usual size, or anything else we can help with..." className={`${field} resize-none`} />
              </div>

              <button type="submit" className="w-full flex h-14 items-center justify-center gap-2 bg-magenta-600 hover:bg-magenta-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(184,21,95,0.4)]">
                <Send className="h-4 w-4" />
                <span>SEND ON WHATSAPP</span>
              </button>
              <p className="text-[11px] text-white/35 text-center">This opens WhatsApp with your message ready to send.</p>
            </form>
          </div>

          {/* ── Direct info ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-white/10 bg-[#15134A] p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-magenta-500 mb-6">DIRECT CHANNELS</h3>

              <div className="space-y-5 text-xs text-white/70">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-white font-bold uppercase">WhatsApp</span>
                    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-magenta-400 transition-colors">Message us</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <a href={`tel:${STORE.phone}`} aria-label="Call us" className="text-magenta-500 hover:text-magenta-400 shrink-0 mt-0.5">
                    <Phone className="h-4 w-4" />
                  </a>
                  <div>
                    <span className="block text-white font-bold uppercase">Call Us</span>
                    <a href={`tel:${STORE.phone}`} className="hover:text-magenta-400 transition-colors">Tap to call</a>
                    <span> · Snapchat </span>
                    <a href={`https://www.snapchat.com/add/${STORE.snapchat}`} target="_blank" rel="noopener noreferrer" className="hover:text-magenta-400 transition-colors">@{STORE.snapchat}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-white font-bold uppercase">Delivery Price</span>
                    <span>We contact you with the delivery price after you place your order.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-magenta-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-white font-bold uppercase">Payment</span>
                    <span>Secure online payment with Paystack, in Ghana cedis.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-[#100E38] p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-magenta-500" />
                WHERE WE ARE
              </h3>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                ShapeWearFit is an online clothing store based in Accra. Place your order on this website and we deliver to your address.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-28 border-t border-white/10 pt-16">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold block mb-2">HELP // FREQUENTLY ASKED</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">
              FREQUENTLY ASKED QUESTIONS<span className="text-magenta-600">.</span>
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} aria-expanded={isOpen} className="flex w-full items-center justify-between text-left group">
                    <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#F5F0EB] group-hover:text-magenta-500 transition-colors">{faq.q}</span>
                    <span className="p-1 text-white/40 group-hover:text-white transition-colors">
                      {isOpen ? <ChevronUp className="h-5 w-5 text-magenta-500" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                  </button>

                  {isOpen && <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed max-w-3xl animate-in fade-in duration-200">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
