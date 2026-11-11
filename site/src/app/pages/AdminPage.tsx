import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogOut,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Mail,
} from 'lucide-react';
import { formatGHS } from '@/lib/money';
import { toInternationalPhone } from '@/lib/checkout-schema';
import {
  adminLoginFn,
  adminLogoutFn,
  adminOrdersFn,
  adminSessionFn,
  adminUpdateOrderFn,
  type AdminSession,
} from '@/backend/admin.functions';
import type { Fulfilment, Order } from '@/backend/orders.server';

const FULFILMENT_LABEL: Record<Fulfilment, string> = {
  new: 'New',
  contacted: 'Customer contacted',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GH', { timeZone: 'Africa/Accra', dateStyle: 'medium', timeStyle: 'short' });

type Filter = 'all' | 'paid' | 'pending' | 'to-contact' | 'delivered';

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setSession(await adminSessionFn());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (!session) {
    return <Shell><p className="text-white/50 text-sm">Loading…</p></Shell>;
  }
  if (!session.configured) {
    return (
      <Shell>
        <div className="max-w-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
          <h1 className="text-lg font-bold uppercase mb-2">Admin is not set up yet</h1>
          <p>
            Add an <code className="font-mono">ADMIN_PASSWORD</code> in your environment settings (see the README), then reload this page.
          </p>
        </div>
      </Shell>
    );
  }
  if (!session.authed) {
    return <Login onDone={loadSession} />;
  }
  return <Dashboard session={session} onLogout={loadSession} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0B0A2A] pt-28 pb-24 px-4 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1200px]">{children}</div></div>;
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await adminLoginFn({ data: { password } });
      if (res.ok) onDone();
      else setError(res.error ?? 'Could not sign in.');
    } catch {
      setError('Could not sign in. Please try again.');
    }
    setBusy(false);
  };

  return (
    <Shell>
      <form onSubmit={submit} className="mx-auto max-w-sm border border-white/10 bg-[#15134A] p-8 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">ShapeWearFit</p>
          <h1 className="mt-1 text-2xl font-black uppercase text-white">Admin sign in</h1>
        </div>
        <div>
          <label htmlFor="pw" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Password</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0B0A2A] border border-white/15 px-4 py-3 text-base sm:text-sm text-white focus:border-magenta-600 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
        <button disabled={busy || !password} className="w-full bg-magenta-600 hover:bg-magenta-700 disabled:opacity-50 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-colors">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Shell>
  );
}

function Dashboard({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await adminOrdersFn());
      setError('');
      setLastLoaded(new Date());
    } catch (e) {
      console.error(e);
      setError('Could not load orders. Your session may have expired — please sign in again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 30000);
    return () => clearInterval(id);
  }, [load]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === 'paid');
    return {
      total: orders.length,
      paid: paid.length,
      awaiting: orders.filter((o) => o.paymentStatus === 'pending').length,
      toContact: paid.filter((o) => o.fulfilment === 'new').length,
      revenue: paid.reduce((sum, o) => sum + o.subtotal, 0),
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === 'paid' && o.paymentStatus !== 'paid') return false;
      if (filter === 'pending' && o.paymentStatus !== 'pending') return false;
      if (filter === 'to-contact' && !(o.paymentStatus === 'paid' && o.fulfilment === 'new')) return false;
      if (filter === 'delivered' && o.fulfilment !== 'delivered') return false;
      if (!q) return true;
      return [o.reference, o.customer.fullName, o.customer.phone, o.customer.email, o.delivery.city]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [orders, filter, query]);

  const logout = async () => {
    await adminLogoutFn();
    onLogout();
  };

  const replaceOrder = (updated: Order) => setOrders((prev) => prev.map((o) => (o.reference === updated.reference ? updated : o)));

  const FILTERS: Array<[Filter, string]> = [
    ['all', 'All'],
    ['to-contact', `To contact (${stats.toContact})`],
    ['paid', 'Paid'],
    ['pending', 'Awaiting payment'],
    ['delivered', 'Delivered'],
  ];

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-magenta-500 font-semibold">ShapeWearFit admin</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black uppercase text-white">Orders</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastLoaded && <span className="hidden sm:block text-[11px] text-white/35">Updated {lastLoaded.toLocaleTimeString('en-GH', { timeZone: 'Africa/Accra', timeStyle: 'short' })}</span>}
          <button onClick={load} className="flex items-center gap-2 border border-white/15 hover:border-white/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-2 border border-white/15 hover:border-white/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>

      {/* Setup warnings */}
      <div className="mt-6 space-y-3">
        {session.storage === 'memory' && (
          <Warning>
            Orders are only being kept in temporary memory and will disappear when the site restarts. Connect Supabase (see README → “Order storage”) to keep them permanently.
          </Warning>
        )}
        {!session.paystack && <Warning>Paystack is not connected — customers cannot pay yet. Add <code className="font-mono">PAYSTACK_SECRET_KEY</code>.</Warning>}
        {!session.telegram && <Warning>Telegram is not connected — you will not get order messages. Add <code className="font-mono">TELEGRAM_BOT_TOKEN</code> and <code className="font-mono">TELEGRAM_CHAT_ID</code>.</Warning>}
        {error && <Warning>{error}</Warning>}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Paid orders" value={String(stats.paid)} />
        <Stat label="Need contacting" value={String(stats.toContact)} highlight={stats.toContact > 0} />
        <Stat label="Awaiting payment" value={String(stats.awaiting)} />
        <Stat label="Paid revenue (excl. delivery)" value={formatGHS(stats.revenue)} />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                filter === key ? 'bg-magenta-600 text-white' : 'border border-white/10 text-white/60 hover:border-white/30 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, reference…"
            className="w-full bg-[#15134A] border border-white/15 pl-9 pr-3 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:border-magenta-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-16 text-center text-sm text-white/40">Loading orders…</p>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40 border border-white/10">
            {orders.length === 0 ? 'No orders yet. They will appear here as soon as a customer starts checkout.' : 'No orders match this filter.'}
          </p>
        ) : (
          visible.map((o) => <OrderRow key={o.reference} order={o} onChange={replaceOrder} />)
        )}
      </div>
    </Shell>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-4 ${highlight ? 'border-magenta-600/60 bg-magenta-600/10' : 'border-white/10 bg-[#15134A]'}`}>
      <p className="text-[10px] uppercase tracking-widest text-white/45">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ tone, children }: { tone: 'green' | 'amber' | 'red' | 'blue' | 'grey'; children: React.ReactNode }) {
  const map = {
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    grey: 'bg-white/5 text-white/60 border-white/15',
  } as const;
  return <span className={`inline-block border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}

function OrderRow({ order, onChange }: { order: Order; onChange: (o: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>(order.fulfilment);
  const [fee, setFee] = useState(order.deliveryFee == null ? '' : String(order.deliveryFee));
  const [note, setNote] = useState(order.adminNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  const dirty =
    fulfilment !== order.fulfilment || note !== order.adminNote || fee !== (order.deliveryFee == null ? '' : String(order.deliveryFee));

  const save = async () => {
    setSaving(true);
    setErr('');
    const feeNumber = fee.trim() === '' ? null : Number(fee);
    if (feeNumber !== null && (Number.isNaN(feeNumber) || feeNumber < 0)) {
      setErr('Delivery fee must be a number.');
      setSaving(false);
      return;
    }
    try {
      const updated = await adminUpdateOrderFn({ data: { reference: order.reference, fulfilment, adminNote: note, deliveryFee: feeNumber } });
      onChange(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      setErr('Could not save. Please try again.');
    }
    setSaving(false);
  };

  const wa = `https://wa.me/${toInternationalPhone(order.customer.phone)}?text=${encodeURIComponent(
    `Hello ${order.customer.fullName.split(' ')[0]}, this is ShapeWearFit about your order ${order.reference}. `
  )}`;

  const payTone = order.paymentStatus === 'paid' ? 'green' : order.paymentStatus === 'failed' ? 'red' : 'amber';
  const fulTone = order.fulfilment === 'delivered' ? 'green' : order.fulfilment === 'cancelled' ? 'red' : order.fulfilment === 'new' ? 'blue' : 'grey';
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const needsContact = order.paymentStatus === 'paid' && order.fulfilment === 'new';

  return (
    <div className={`border bg-[#100E38] ${needsContact ? 'border-magenta-600/50' : 'border-white/10'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 sm:px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2" aria-expanded={open}>
        <div className="min-w-[160px]">
          <p className="font-mono text-xs font-bold text-magenta-400">{order.reference}</p>
          <p className="text-[11px] text-white/40">{when(order.createdAt)}</p>
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="text-sm font-bold text-white">{order.customer.fullName}</p>
          <p className="text-xs text-white/50">{order.customer.phone} · {order.delivery.city}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={payTone}>{order.paymentStatus === 'pending' ? 'Awaiting payment' : order.paymentStatus === 'paid' ? 'Paid' : 'Payment failed'}</Badge>
          <Badge tone={fulTone}>{FULFILMENT_LABEL[order.fulfilment]}</Badge>
        </div>
        <div className="text-right ml-auto">
          <p className="text-sm font-bold text-white">{formatGHS(order.subtotal)}</p>
          <p className="text-[11px] text-white/40">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 sm:px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
          <div className="space-y-6">
            <section>
              <h3 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">Items</h3>
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-4 py-2.5 text-white/85">
                    <span>{i.quantity} × {i.name} <span className="font-bold text-white">· size {i.size}{i.fit ? ` · ${i.fit}` : ''}</span></span>
                    <span className="whitespace-nowrap">{formatGHS(i.lineTotal)}</span>
                  </li>
                ))}
                <li className="flex justify-between py-2.5 font-bold text-white"><span>Subtotal {order.paymentStatus === 'paid' ? '(paid)' : ''}</span><span>{formatGHS(order.subtotal)}</span></li>
                {order.deliveryFee != null && (
                  <li className="flex justify-between py-2.5 text-white/80"><span>Delivery fee (agreed)</span><span>{formatGHS(order.deliveryFee)}</span></li>
                )}
              </ul>
              {order.paidAt && <p className="mt-2 text-[11px] text-white/40">Paid {when(order.paidAt)}{order.paystackTransactionId ? ` · Paystack #${order.paystackTransactionId}` : ''}</p>}
            </section>

            <section>
              <h3 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">Delivery details</h3>
              <address className="not-italic text-white/85 leading-relaxed">
                {order.delivery.address}<br />
                {order.delivery.city}, {order.delivery.region}
                {order.delivery.landmark && <><br />Landmark: {order.delivery.landmark}</>}
                {order.delivery.digitalAddress && <><br />GPS: {order.delivery.digitalAddress}</>}
              </address>
              {order.notes && <p className="mt-3 text-white/70"><span className="text-white/40">Customer note:</span> {order.notes}</p>}
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">Contact customer</h3>
              <div className="flex flex-wrap gap-2">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                <a href={`tel:${order.customer.phone}`} className="inline-flex items-center gap-2 border border-white/20 hover:border-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"><Phone className="h-3.5 w-3.5" /> {order.customer.phone}</a>
                <a href={`mailto:${order.customer.email}`} className="inline-flex items-center gap-2 border border-white/20 hover:border-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"><Mail className="h-3.5 w-3.5" /> Email</a>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold">Manage order</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs text-white/60">
                  Status
                  <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value as Fulfilment)} className="mt-1.5 w-full bg-[#0B0A2A] border border-white/15 px-3 py-2.5 text-base sm:text-sm text-white focus:border-magenta-600 focus:outline-none">
                    {(Object.keys(FULFILMENT_LABEL) as Fulfilment[]).map((k) => <option key={k} value={k}>{FULFILMENT_LABEL[k]}</option>)}
                  </select>
                </label>
                <label className="block text-xs text-white/60">
                  Agreed delivery fee (GH₵)
                  <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" placeholder="Not set" className="mt-1.5 w-full bg-[#0B0A2A] border border-white/15 px-3 py-2.5 text-base sm:text-sm text-white focus:border-magenta-600 focus:outline-none" />
                </label>
              </div>
              <label className="block text-xs text-white/60">
                Your private note
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1.5 w-full bg-[#0B0A2A] border border-white/15 px-3 py-2.5 text-base sm:text-sm text-white focus:border-magenta-600 focus:outline-none resize-none" />
              </label>
              <div className="flex items-center gap-3">
                <button onClick={save} disabled={!dirty || saving} className="bg-magenta-600 hover:bg-magenta-700 disabled:opacity-40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {saved && <span className="text-xs text-emerald-400">Saved ✓</span>}
                {err && <span className="text-xs text-red-400">{err}</span>}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
