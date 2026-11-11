import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertCircle, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatGHS } from '@/lib/money';
import { STORE, whatsappLink } from '@/lib/store-info';
import { verifyPaymentFn, type PublicOrderStatus } from '@/backend/checkout.functions';

const MAX_TRIES = 6;

export default function OrderConfirmationPage({ reference }: { reference: string | undefined }) {
  const { clearCart } = useCart();
  const [result, setResult] = useState<PublicOrderStatus | null>(null);
  const [tries, setTries] = useState(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    const check = async (attempt: number) => {
      try {
        const res = await verifyPaymentFn({ data: { reference } });
        if (cancelled) return;
        setResult(res);
        setTries(attempt);
        if (res.status === 'pending' && attempt < MAX_TRIES) {
          setTimeout(() => check(attempt + 1), 3000);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setResult({ status: 'pending' });
      }
    };
    check(1);
    return () => {
      cancelled = true;
    };
  }, [reference]);

  // The bag is emptied only once payment is confirmed.
  useEffect(() => {
    if (result?.status === 'paid' && !cleared.current) {
      cleared.current = true;
      clearCart();
      try {
        localStorage.removeItem('shapewearfit_checkout_v1');
      } catch {
        /* ignore */
      }
    }
  }, [result, clearCart]);

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#0B0A2A] pt-28 sm:pt-32 pb-32 px-6 sm:px-10">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );

  if (!reference) {
    return shell(
      <Panel icon={<AlertCircle className="h-8 w-8" />} tone="warn" title="No order found">
        <p>We could not find an order reference. If you have just paid, please contact us with your payment receipt.</p>
        <Actions />
      </Panel>
    );
  }

  if (!result || (result.status === 'pending' && tries < MAX_TRIES)) {
    return shell(
      <Panel icon={<Loader2 className="h-8 w-8 animate-spin" />} tone="info" title="Confirming your payment…">
        <p>Please wait a moment while we confirm your payment with Paystack. Do not close this page.</p>
      </Panel>
    );
  }

  if (result.status === 'paid') {
    return shell(
      <Panel icon={<CheckCircle2 className="h-8 w-8" />} tone="ok" title="Thank you — payment received!">
        <p>
          {result.customerName ? `${result.customerName.split(' ')[0]}, we` : 'We'} have received your order and payment.
        </p>
        <div className="mt-5 inline-block border border-magenta-600/40 bg-magenta-600/10 px-5 py-2 font-mono text-sm font-bold text-magenta-400">
          {result.reference}
        </div>

        {result.items && (
          <ul className="mt-6 divide-y divide-white/10 border-y border-white/10 text-left text-sm">
            {result.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-4 py-3 text-white/80">
                <span>
                  {i.quantity} × {i.name} <span className="text-white/40">(size {i.size}{i.fit ? `, ${i.fit}` : ''})</span>
                </span>
                <span className="whitespace-nowrap">{formatGHS(i.lineTotal)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3 font-bold text-white">
              <span>Paid</span>
              <span>{formatGHS(result.subtotal ?? 0)}</span>
            </li>
          </ul>
        )}

        <div className="mt-6 border border-white/10 bg-[#15134A] p-5 text-left text-sm text-white/75">
          <p className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 shrink-0 text-magenta-500" />
            <span>
              <strong className="text-white">What happens next:</strong> we will contact you on the phone number you gave us to agree the
              delivery price and arrange delivery. A Paystack receipt has been sent to your email.
            </span>
          </p>
        </div>
        <Actions />
      </Panel>
    );
  }

  if (result.status === 'failed') {
    return shell(
      <Panel icon={<AlertCircle className="h-8 w-8" />} tone="warn" title="Payment was not completed">
        <p>Your payment did not go through, so you have not been charged for this order. Your bag is still saved.</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link to="/checkout" className="bg-magenta-600 hover:bg-magenta-700 text-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors">
            Try again
          </Link>
          <a href={whatsappLink(`Hello ShapeWearFit, my payment for order ${reference} did not go through.`)} target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white text-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors">
            Chat on WhatsApp
          </a>
        </div>
      </Panel>
    );
  }

  // not_found, or still pending after several checks
  return shell(
    <Panel icon={<AlertCircle className="h-8 w-8" />} tone="warn" title={result.status === 'not_found' ? 'Order not found' : 'We are still confirming your payment'}>
      <p>
        {result.status === 'not_found'
          ? 'We could not find that order.'
          : 'Your payment has not been confirmed yet. If you were charged, do not pay again — we will confirm it shortly.'}{' '}
        Reference: <span className="font-mono text-white">{reference}</span>
      </p>
      <p className="mt-3">
        Questions? <a href={`tel:${STORE.phone}`} className="underline text-white">Call us</a> or{' '}
        <a href={whatsappLink(`Hello ShapeWearFit, please confirm my order ${reference}.`)} className="underline text-white">message us on WhatsApp</a>.
      </p>
      <Actions />
    </Panel>
  );
}

function Panel({
  icon,
  tone,
  title,
  children,
}: {
  icon: React.ReactNode;
  tone: 'ok' | 'warn' | 'info';
  title: string;
  children: React.ReactNode;
}) {
  const colours =
    tone === 'ok'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : tone === 'warn'
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        : 'bg-magenta-600/10 border-magenta-600/30 text-magenta-400';
  return (
    <div className="border border-white/10 bg-[#100E38] p-8 sm:p-12 text-center text-sm text-white/70 leading-relaxed">
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border ${colours}`}>{icon}</div>
      <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mb-3">{title}</h1>
      {children}
    </div>
  );
}

function Actions() {
  return (
    <div className="mt-8 flex flex-wrap gap-3 justify-center">
      <Link to="/shop" className="bg-magenta-600 hover:bg-magenta-700 text-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors">
        Continue shopping
      </Link>
    </div>
  );
}
