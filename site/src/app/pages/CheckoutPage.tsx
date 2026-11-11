import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertCircle, Lock, MapPin, Truck, User } from 'lucide-react';
import CartIcon from '../components/ui/CartIcon';
import { useCart } from '../context/CartContext';
import { GHANA_REGIONS, customerSchema, type CustomerInput } from '@/lib/checkout-schema';
import { formatGHS } from '@/lib/money';
import { whatsappLink } from '@/lib/store-info';
import { startCheckoutFn } from '@/backend/checkout.functions';

const DRAFT_KEY = 'shapewearfit_checkout_v1';

const EMPTY: Required<CustomerInput> = {
  fullName: '',
  phone: '',
  email: '',
  region: 'Greater Accra',
  city: '',
  address: '',
  landmark: '',
  digitalAddress: '',
  notes: '',
};

const inputClass = (hasError: boolean) =>
  `w-full bg-[#0B0A2A] border px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors ${
    hasError ? 'border-red-500/70 focus:border-red-400' : 'border-white/15 focus:border-magenta-600'
  }`;

function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | undefined;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs uppercase tracking-wider text-white/60 mb-2">
        {label} {required && <span className="text-magenta-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-white/35">{hint}</p>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, openCart } = useCart();
  const [form, setForm] = useState<Required<CustomerInput>>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Restore what the customer already typed (e.g. they came back from Paystack)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      /* ignore */
    }
  }, []);

  const set = (key: keyof typeof EMPTY) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError('');

    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
      setErrors(found);
      setFormError('Please check the highlighted details.');
      const firstKey = Object.keys(found)[0];
      if (firstKey) formRef.current?.querySelector<HTMLElement>(`#${firstKey}`)?.focus();
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const result = await startCheckoutFn({
        data: {
          customer: form,
          items: items.map((i) => ({ productId: i.id, size: i.selectedSize, fit: i.selectedFit, quantity: i.quantity })),
          website: honeypot,
        },
      });
      if (result.ok) {
        window.location.assign(result.authorizationUrl); // hand over to Paystack's secure page
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
    } catch (error) {
      console.error(error);
      setFormError('Something went wrong. Please try again, or contact us on WhatsApp.');
    }
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0A2A] pt-32 pb-32 px-6 flex items-start justify-center">
        <div className="max-w-md text-center">
          <CartIcon className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-2xl font-black uppercase text-white">Your bag is empty</h1>
          <p className="mt-2 text-sm text-white/60">Add an office shirt or a jersey to your bag, then come back to check out.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-magenta-600 hover:bg-magenta-700 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A2A] pt-24 sm:pt-28 pb-32 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="border-b border-white/10 pb-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-magenta-600 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">SECURE CHECKOUT</span>
          </div>
          <h1 className="mt-4 text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F0EB]">
            Your details<span className="text-magenta-600">.</span>
          </h1>
          <p className="mt-2 text-sm text-white/60 max-w-xl">
            Fill in your contact and delivery details, then pay securely with Paystack.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ── Form ── */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="lg:col-span-7 space-y-8">
            {formError && (
              <div className="flex items-start gap-3 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300" role="alert">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Honeypot — hidden from people */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>

            <section className="border border-white/10 bg-[#15134A] p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white mb-6">
                <User className="h-4 w-4 text-magenta-500" /> Contact details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Field label="Full name" required error={errors['fullName']} htmlFor="fullName">
                    <input id="fullName" type="text" autoComplete="name" value={form.fullName} onChange={(e) => set('fullName')(e.target.value)} placeholder="e.g. Ama Mensah" className={inputClass(!!errors['fullName'])} />
                  </Field>
                </div>
                <Field label="Phone number" required error={errors['phone']} hint="We will call or WhatsApp this number about delivery." htmlFor="phone">
                  <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="024 412 3456" className={inputClass(!!errors['phone'])} />
                </Field>
                <Field label="Email address" required error={errors['email']} hint="Your payment receipt is sent here." htmlFor="email">
                  <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="you@example.com" className={inputClass(!!errors['email'])} />
                </Field>
              </div>
            </section>

            <section className="border border-white/10 bg-[#15134A] p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white mb-6">
                <MapPin className="h-4 w-4 text-magenta-500" /> Delivery details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Region" required error={errors['region']} htmlFor="region">
                  <select id="region" value={form.region} onChange={(e) => set('region')(e.target.value)} autoComplete="address-level1" className={inputClass(!!errors['region'])}>
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Town / area" required error={errors['city']} htmlFor="city">
                  <input id="city" type="text" autoComplete="address-level2" value={form.city} onChange={(e) => set('city')(e.target.value)} placeholder="e.g. East Legon" className={inputClass(!!errors['city'])} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Delivery address" required error={errors['address']} hint="House number, street name and any directions." htmlFor="address">
                    <input id="address" type="text" autoComplete="street-address" value={form.address} onChange={(e) => set('address')(e.target.value)} placeholder="e.g. House 12, Lagos Avenue" className={inputClass(!!errors['address'])} />
                  </Field>
                </div>
                <Field label="Nearest landmark" error={errors['landmark']} htmlFor="landmark">
                  <input id="landmark" type="text" value={form.landmark} onChange={(e) => set('landmark')(e.target.value)} placeholder="Optional" className={inputClass(!!errors['landmark'])} />
                </Field>
                <Field label="Ghana Post GPS address" error={errors['digitalAddress']} hint="Optional, e.g. GA-123-4567" htmlFor="digitalAddress">
                  <input id="digitalAddress" type="text" value={form.digitalAddress} onChange={(e) => set('digitalAddress')(e.target.value.toUpperCase())} placeholder="GA-123-4567" className={inputClass(!!errors['digitalAddress'])} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Order notes" error={errors['notes']} htmlFor="notes">
                    <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set('notes')(e.target.value)} placeholder="Optional — anything we should know about your order or delivery" className={`${inputClass(!!errors['notes'])} resize-none`} />
                  </Field>
                </div>
              </div>
            </section>

            <div className="lg:hidden">
              <SubmitBlock submitting={submitting} subtotal={subtotal} />
            </div>
          </form>

          {/* ── Order summary ── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
            <div className="border border-white/10 bg-[#100E38] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">Order summary</h2>
                <button type="button" onClick={openCart} className="text-[11px] uppercase tracking-wider text-magenta-500 underline hover:text-magenta-400">
                  Edit bag
                </button>
              </div>

              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={`${item.id}-${item.selectedSize}-${item.selectedFit ?? ''}`} className="flex gap-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden bg-navy-950">
                      {item.images[0] && <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#F5F0EB]">{item.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-white/45">
                        Size {item.selectedSize}{item.selectedFit ? ` · ${item.selectedFit}` : ''} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#F5F0EB] whitespace-nowrap">{formatGHS(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between text-white/70">
                  <dt>Subtotal</dt>
                  <dd>{formatGHS(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-white/70">
                  <dt className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" /> Delivery
                  </dt>
                  <dd className="text-right text-xs text-white/60">We will contact you<br />with the price</dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                  <dt>To pay now</dt>
                  <dd>{formatGHS(subtotal)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-white/40">
                The delivery price is not charged now. After your order, we will contact you on the phone number you gave to agree the delivery price.
              </p>
            </div>

            <div className="hidden lg:block">
              <SubmitBlock submitting={submitting} subtotal={subtotal} formId={formRef} />
            </div>

            <p className="text-center text-[11px] text-white/35">
              Need help?{' '}
              <a href={whatsappLink('Hello ShapeWearFit, I need help with my order.')} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                WhatsApp us
              </a>
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SubmitBlock({
  submitting,
  subtotal,
  formId,
}: {
  submitting: boolean;
  subtotal: number;
  formId?: React.RefObject<HTMLFormElement | null>;
}) {
  return (
    <div>
      <button
        type={formId ? 'button' : 'submit'}
        onClick={formId ? () => formId.current?.requestSubmit() : undefined}
        disabled={submitting}
        className="w-full flex h-14 items-center justify-center gap-2 bg-magenta-600 hover:bg-magenta-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(184,21,95,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Taking you to Paystack…</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Pay {formatGHS(subtotal)} with Paystack</span>
          </>
        )}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
        <Lock className="h-3 w-3" /> You will pay on Paystack&apos;s secure page.
      </p>
    </div>
  );
}
