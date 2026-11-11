/**
 * Core checkout logic — kept free of framework code so it can be unit-tested.
 *
 *  startCheckout   : validate form -> rebuild prices from the catalogue -> save order (awaiting payment)
 *                    -> create the Paystack payment -> Telegram "new checkout" message
 *  settleOrder     : confirm a payment with Paystack, mark the order paid, Telegram "payment received"
 */
import { checkoutSchema, type CustomerDetails } from '../lib/checkout-schema';
import { toPesewas } from '../lib/money';
import { getProductById } from '../app/data/products';
import {
  getOrder,
  insertOrder,
  markOrderPaid,
  saveOrder,
  type Order,
  type OrderItem,
} from './orders.server';
import { formatOrderMessage, sendTelegram } from './telegram.server';
import {
  initializeTransaction,
  paystackConfigured,
  verifyTransaction,
  type PaystackTransaction,
} from './paystack.server';

export type StartCheckoutResult =
  | { ok: true; reference: string; authorizationUrl: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters

export function generateReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return 'SWF-' + [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** Turns the customer's cart lines into priced order lines using OUR catalogue, never the browser's prices. */
export function priceItems(
  lines: Array<{ productId: string; size: string; fit?: string | undefined; quantity: number }>
): { items: OrderItem[]; subtotal: number } | { error: string } {
  const merged = new Map<string, { productId: string; size: string; fit?: string | undefined; quantity: number }>();
  for (const l of lines) {
    const key = `${l.productId}|${l.size}|${l.fit ?? ''}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, quantity: existing.quantity + l.quantity } : { ...l });
  }

  const items: OrderItem[] = [];
  for (const l of merged.values()) {
    const product = getProductById(l.productId);
    if (!product) return { error: 'One of the items in your bag is no longer available. Please review your bag.' };
    if (!product.sizes.includes(l.size)) return { error: `Size ${l.size} is not available for ${product.name}.` };
    if (product.fits && !(l.fit && product.fits.includes(l.fit))) {
      return { error: `Please choose Custom Fit or Slim Fit for ${product.name}.` };
    }
    if (l.quantity > 20) return { error: 'Please contact us to order more than 20 of one item.' };
    items.push({
      productId: product.id,
      name: product.name,
      size: l.size,
      ...(product.fits ? { fit: l.fit } : {}),
      quantity: l.quantity,
      unitPrice: product.price,
      lineTotal: Math.round(product.price * l.quantity * 100) / 100,
    });
  }
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  return { items, subtotal };
}

export async function startCheckout(input: unknown, siteOrigin: string): Promise<StartCheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === 'customer' ? String(issue.path[1] ?? '') : String(issue.path[0] ?? '');
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: 'Please check the highlighted details and try again.', fieldErrors };
  }
  const { customer, items: lines, website } = parsed.data;

  // Honeypot: bots fill hidden fields. Pretend it worked, do nothing.
  if (website) return { ok: true, reference: 'SWF-IGNORED', authorizationUrl: siteOrigin + '/' };

  if (!paystackConfigured()) {
    console.error('[checkout] PAYSTACK_SECRET_KEY is not set');
    return {
      ok: false,
      error: 'Online payment is not available right now. Please contact us on WhatsApp to place your order.',
    };
  }

  const priced = priceItems(lines);
  if ('error' in priced) return { ok: false, error: priced.error };

  const now = new Date().toISOString();
  const order: Order = {
    reference: generateReference(),
    createdAt: now,
    updatedAt: now,
    paymentStatus: 'pending',
    fulfilment: 'new',
    customer: { fullName: customer.fullName, phone: customer.phone, email: customer.email },
    delivery: {
      region: customer.region,
      city: customer.city,
      address: customer.address,
      landmark: customer.landmark,
      digitalAddress: customer.digitalAddress,
    },
    notes: customer.notes,
    items: priced.items,
    subtotal: priced.subtotal,
    currency: 'GHS',
    deliveryFee: null,
    adminNote: '',
    telegram: { checkout: false, paid: false },
  };

  try {
    await insertOrder(order);
  } catch (error) {
    console.error('[checkout] could not save order', error);
    return { ok: false, error: 'We could not save your order. Please try again in a moment.' };
  }

  // Start the Paystack payment (delivery fee is NOT charged — we agree it with the customer afterwards)
  let authorizationUrl: string;
  try {
    const tx = await initializeTransaction({
      email: customer.email,
      amountPesewas: toPesewas(order.subtotal),
      reference: order.reference,
      callbackUrl: `${siteOrigin}/order-confirmation`,
      metadata: {
        customer_name: customer.fullName,
        phone: customer.phone,
        items: order.items.map((i) => `${i.quantity}x ${i.name} (${i.size}${i.fit ? `, ${i.fit}` : ''})`).join(', '),
      },
    });
    authorizationUrl = tx.authorizationUrl;
  } catch (error) {
    console.error('[checkout] paystack initialize failed', error);
    order.paymentStatus = 'failed';
    await saveOrder(order).catch(() => {});
    return { ok: false, error: 'We could not start the payment. Please try again, or contact us on WhatsApp.' };
  }

  // Quick message to the owner's Telegram: a customer is on their way to pay.
  order.telegram.checkout = await sendTelegram(formatOrderMessage(order, 'checkout'));
  await saveOrder(order).catch((e) => console.error('[checkout] could not update telegram flag', e));

  return { ok: true, reference: order.reference, authorizationUrl };
}

export type SettleStatus = 'paid' | 'pending' | 'failed' | 'not_found';

export interface SettleResult {
  status: SettleStatus;
  order?: Order;
}

/**
 * Confirms a payment with Paystack (the source of truth) and updates the order.
 * Safe to call many times, from the customer's return page AND the webhook:
 * the "payment received" Telegram message is sent only once.
 */
export async function settleOrder(reference: string, known?: PaystackTransaction): Promise<SettleResult> {
  const order = await getOrder(reference);
  if (!order) return { status: 'not_found' };
  if (order.paymentStatus === 'paid') return { status: 'paid', order };

  let tx: PaystackTransaction;
  try {
    tx = known ?? (await verifyTransaction(reference));
  } catch (error) {
    console.error('[settle] verify failed', error);
    return { status: 'pending', order };
  }

  if (tx.status === 'success') {
    // Guard against a payment for the wrong amount/currency being accepted as this order.
    if (tx.currency !== 'GHS' || tx.amount !== toPesewas(order.subtotal)) {
      console.error('[settle] amount mismatch', { reference, expected: toPesewas(order.subtotal), got: tx.amount, currency: tx.currency });
      order.paymentStatus = 'failed';
      order.adminNote = `${order.adminNote}\n⚠️ Paystack reported ${tx.currency} ${tx.amount / 100} but order total is GHS ${order.subtotal}. Check Paystack dashboard.`.trim();
      await saveOrder(order);
      await sendTelegram(
        `⚠️ <b>Payment amount mismatch</b>\nOrder <code>${order.reference}</code> — check your Paystack dashboard before fulfilling.`
      );
      return { status: 'failed', order };
    }

    const paidNow = await markOrderPaid(reference, {
      paidAt: tx.paid_at ?? new Date().toISOString(),
      transactionId: String(tx.id),
    });
    if (paidNow) {
      paidNow.telegram.paid = await sendTelegram(formatOrderMessage(paidNow, 'paid'));
      await saveOrder(paidNow).catch((e) => console.error('[settle] could not update telegram flag', e));
      return { status: 'paid', order: paidNow };
    }
    return { status: 'paid', order: (await getOrder(reference)) ?? order };
  }

  if (tx.status === 'failed' || tx.status === 'abandoned' || tx.status === 'reversed') {
    return { status: 'failed', order };
  }
  return { status: 'pending', order };
}
