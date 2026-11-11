/**
 * Order storage.
 *
 * - With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, orders are saved in the
 *   `orders` table (see supabase/orders.sql) through Supabase's REST API.
 * - Otherwise they are kept in memory. That is fine for trying things out locally,
 *   but it is NOT permanent (orders vanish on restart / between serverless instances),
 *   and the admin dashboard shows a warning when this is the case.
 */
import { env } from './env.server';

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type Fulfilment = 'new' | 'contacted' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  /** Long-sleeve shirts only: 'Custom Fit' or 'Slim Fit'. */
  fit?: string | undefined;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  reference: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  paystackTransactionId?: string;
  fulfilment: Fulfilment;
  customer: { fullName: string; phone: string; email: string };
  delivery: { region: string; city: string; address: string; landmark: string; digitalAddress: string };
  notes: string;
  items: OrderItem[];
  subtotal: number;
  currency: 'GHS';
  /** Set by the admin once the delivery price has been agreed with the customer. */
  deliveryFee: number | null;
  adminNote: string;
  telegram: { checkout: boolean; paid: boolean };
}

export type StorageMode = 'supabase' | 'memory';

export function storageMode(): StorageMode {
  return env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY') ? 'supabase' : 'memory';
}

// ── In-memory fallback ─────────────────────────────────────
const g = globalThis as unknown as { __swfOrders?: Map<string, Order> };
function memory(): Map<string, Order> {
  if (!g.__swfOrders) g.__swfOrders = new Map();
  return g.__swfOrders;
}

/** Test helper */
export function __resetMemoryOrders() {
  g.__swfOrders = new Map();
}

// ── Supabase REST ──────────────────────────────────────────
function sb(path: string, init: RequestInit & { prefer?: string } = {}) {
  const base = env('SUPABASE_URL')!.replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY')!;
  const { prefer, ...rest } = init;
  return fetch(`${base}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
      ...(rest.headers as Record<string, string> | undefined),
    },
  });
}

async function sbCheck(res: Response, what: string) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${what} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res;
}

const row = (o: Order) => ({
  reference: o.reference,
  created_at: o.createdAt,
  payment_status: o.paymentStatus,
  fulfilment: o.fulfilment,
  data: o,
});

// ── Public API ─────────────────────────────────────────────
export async function insertOrder(order: Order): Promise<void> {
  if (storageMode() === 'memory') {
    memory().set(order.reference, order);
    return;
  }
  await sbCheck(await sb('orders', { method: 'POST', body: JSON.stringify(row(order)), prefer: 'return=minimal' }), 'insert');
}

export async function getOrder(reference: string): Promise<Order | null> {
  if (storageMode() === 'memory') return memory().get(reference) ?? null;
  const res = await sbCheck(
    await sb(`orders?reference=eq.${encodeURIComponent(reference)}&select=data&limit=1`),
    'read'
  );
  const rows = (await res.json()) as Array<{ data: Order }>;
  return rows[0]?.data ?? null;
}

/** Overwrite an order (used for status / note updates). */
export async function saveOrder(order: Order): Promise<void> {
  order.updatedAt = new Date().toISOString();
  if (storageMode() === 'memory') {
    memory().set(order.reference, order);
    return;
  }
  const { reference, ...rest } = row(order);
  await sbCheck(
    await sb(`orders?reference=eq.${encodeURIComponent(reference)}`, {
      method: 'PATCH',
      body: JSON.stringify(rest),
      prefer: 'return=minimal',
    }),
    'update'
  );
}

export async function listOrders(limit = 300): Promise<Order[]> {
  if (storageMode() === 'memory') {
    return [...memory().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
  const res = await sbCheck(await sb(`orders?select=data&order=created_at.desc&limit=${limit}`), 'list');
  return ((await res.json()) as Array<{ data: Order }>).map((r) => r.data);
}

/**
 * Atomically flips an order from not-paid to paid.
 * Returns the updated order the FIRST time only; returns null if it was already paid
 * (so a webhook and the customer's return visit never both trigger notifications).
 */
export async function markOrderPaid(
  reference: string,
  info: { paidAt: string; transactionId?: string }
): Promise<Order | null> {
  const current = await getOrder(reference);
  if (!current || current.paymentStatus === 'paid') return null;

  const updated: Order = {
    ...current,
    paymentStatus: 'paid',
    paidAt: info.paidAt,
    ...(info.transactionId ? { paystackTransactionId: info.transactionId } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (storageMode() === 'memory') {
    memory().set(reference, updated);
    return updated;
  }

  // Conditional update: only succeeds for the request that flips the status.
  const res = await sbCheck(
    await sb(`orders?reference=eq.${encodeURIComponent(reference)}&payment_status=neq.paid`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: 'paid', data: updated }),
      prefer: 'return=representation',
    }),
    'mark paid'
  );
  const rows = (await res.json()) as unknown[];
  return rows.length > 0 ? updated : null;
}
