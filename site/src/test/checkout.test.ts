// @vitest-environment node
import { createHmac } from 'node:crypto';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeGhanaPhone } from '@/lib/checkout-schema';
import { priceItems, settleOrder, startCheckout } from '@/backend/checkout-service.server';
import { __resetMemoryOrders, getOrder, listOrders } from '@/backend/orders.server';
import { verifyWebhookSignature } from '@/backend/paystack.server';
import { checkAdminPassword, createAdminToken, verifyAdminToken } from '@/backend/admin-auth.server';

const customer = {
  fullName: 'Ama Mensah',
  phone: '024 412 3456',
  email: 'Ama@Example.com',
  region: 'Greater Accra',
  city: 'East Legon',
  address: 'House 12, Lagos Avenue',
};
const items = [{ productId: 'shirt-oxford-pink', size: 'L', fit: 'Slim Fit', quantity: 2 }];

type Call = { url: string; body: any };
let calls: Call[];
let paystackStatus: string;
let paystackAmount: number | undefined;

function mockFetch() {
  calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, body });
      if (url.includes('/transaction/initialize')) {
        return Response.json({ status: true, data: { authorization_url: 'https://checkout.paystack.com/abc', access_code: 'abc', reference: body.reference } });
      }
      if (url.includes('/transaction/verify/')) {
        const reference = decodeURIComponent(url.split('/verify/')[1]!);
        const order = await getOrder(reference);
        return Response.json({
          status: true,
          data: { id: 99, status: paystackStatus, reference, currency: 'GHS', amount: paystackAmount ?? Math.round((order?.subtotal ?? 0) * 100), paid_at: '2026-11-09T10:00:00Z' },
        });
      }
      if (url.includes('api.telegram.org')) return Response.json({ ok: true });
      throw new Error('unexpected fetch ' + url);
    })
  );
}

const telegramMessages = () => calls.filter((c) => c.url.includes('api.telegram.org')).map((c) => c.body.text as string);

beforeEach(() => {
  __resetMemoryOrders();
  paystackStatus = 'success';
  paystackAmount = undefined;
  vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_123');
  vi.stubEnv('TELEGRAM_BOT_TOKEN', '111:abc');
  vi.stubEnv('TELEGRAM_CHAT_ID', '555');
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('ADMIN_PASSWORD', 'letmein');
  mockFetch();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('phone numbers', () => {
  it('accepts Ghana formats and normalises them', () => {
    expect(normalizeGhanaPhone('024 412 3456')).toBe('0244123456');
    expect(normalizeGhanaPhone('+233244123456')).toBe('0244123456');
    expect(normalizeGhanaPhone('233244123456')).toBe('0244123456');
  });
  it('rejects bad numbers', () => {
    expect(normalizeGhanaPhone('12345')).toBeNull();
    expect(normalizeGhanaPhone('+1 415 555 2671')).toBeNull();
  });
});

describe('pricing', () => {
  it('uses catalogue prices and merges duplicate lines', () => {
    const r = priceItems([
      { productId: 'shirt-oxford-pink', size: 'L', fit: 'Slim Fit', quantity: 1 },
      { productId: 'shirt-oxford-pink', size: 'L', fit: 'Slim Fit', quantity: 1 },
    ]);
    expect(r).toEqual(expect.objectContaining({ subtotal: 360 }));
  });
  it('rejects unknown products and sizes a product does not have', () => {
    expect(priceItems([{ productId: 'nope', size: 'M', quantity: 1 }])).toHaveProperty('error');
    expect(priceItems([{ productId: 'shirt-oxford-pink', size: 'XXL', fit: 'Slim Fit', quantity: 1 }])).toHaveProperty('error'); // shirts stop at XL
  });

  it('requires a valid fit for long-sleeve shirts, keeps fits as separate lines, and ignores fit on jerseys', () => {
    expect(priceItems([{ productId: 'shirt-oxford-pink', size: 'L', quantity: 1 }])).toHaveProperty('error'); // no fit
    expect(priceItems([{ productId: 'shirt-oxford-pink', size: 'L', fit: 'Baggy', quantity: 1 }])).toHaveProperty('error');
    const r = priceItems([
      { productId: 'shirt-oxford-pink', size: 'L', fit: 'Slim Fit', quantity: 1 },
      { productId: 'shirt-oxford-pink', size: 'L', fit: 'Custom Fit', quantity: 1 },
      { productId: 'club-sky-blue', size: 'M', fit: 'Slim Fit', quantity: 1 },
    ]);
    if ('error' in r) throw new Error(r.error);
    expect(r.items.map((i) => i.fit)).toEqual(['Slim Fit', 'Custom Fit', undefined]);
  });
});

describe('startCheckout', () => {
  it('saves the order, charges the catalogue total (never a client price), and alerts Telegram', async () => {
    const tampered = { customer, items: [{ ...items[0]!, price: 1 }] }; // extra "price" field must be ignored
    const res = await startCheckout(tampered, 'https://shop.test');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.authorizationUrl).toBe('https://checkout.paystack.com/abc');

    const init = calls.find((c) => c.url.includes('/initialize'))!;
    expect(init.body.amount).toBe(36000); // 2 x GH₵180, in pesewas
    expect(init.body.currency).toBe('GHS');
    expect(init.body.email).toBe('ama@example.com');
    expect(init.body.callback_url).toBe('https://shop.test/order-confirmation');

    const order = (await getOrder(res.reference))!;
    expect(order.paymentStatus).toBe('pending');
    expect(order.customer.phone).toBe('0244123456');
    expect(order.deliveryFee).toBeNull();
    expect(order.telegram.checkout).toBe(true);

    const msgs = telegramMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('NEW CHECKOUT');
    expect(msgs[0]).toContain('Ama Mensah');
    expect(msgs[0]).toContain('size <b>L</b>, <b>Slim Fit</b>');
    expect(calls.find((c) => c.url.includes('api.telegram.org'))!.body.chat_id).toBe('555');
  });

  it('returns field errors for a bad form and creates no order', async () => {
    const res = await startCheckout({ customer: { ...customer, phone: '123', email: 'x' }, items }, 'https://shop.test');
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.fieldErrors).toHaveProperty('phone');
    expect(res.fieldErrors).toHaveProperty('email');
    expect(await listOrders()).toHaveLength(0);
    expect(telegramMessages()).toHaveLength(0);
  });

  it('escapes HTML in customer-supplied text for Telegram', async () => {
    await startCheckout({ customer: { ...customer, fullName: 'Bad <b>Name</b> & co' }, items }, 'https://shop.test');
    expect(telegramMessages()[0]).toContain('Bad &lt;b&gt;Name&lt;/b&gt; &amp; co');
  });

  it('still completes when Telegram is down, and flags it', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('telegram')) throw new Error('network');
      return Response.json({ status: true, data: { authorization_url: 'https://p.test/x', access_code: 'a', reference: JSON.parse(String(init!.body)).reference } });
    }));
    const res = await startCheckout({ customer, items }, 'https://shop.test');
    expect(res.ok).toBe(true);
    if (res.ok) expect((await getOrder(res.reference))!.telegram.checkout).toBe(false);
  });

  it('marks the order failed and tells the customer when Paystack refuses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: false, message: 'bad key' }, { status: 401 })));
    const res = await startCheckout({ customer, items }, 'https://shop.test');
    expect(res.ok).toBe(false);
    expect((await listOrders())[0]!.paymentStatus).toBe('failed');
  });

  it('refuses cleanly when Paystack is not configured', async () => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', '');
    const res = await startCheckout({ customer, items }, 'https://shop.test');
    expect(res.ok).toBe(false);
    expect(await listOrders()).toHaveLength(0);
  });

  it('silently ignores honeypot (bot) submissions', async () => {
    const res = await startCheckout({ customer, items, website: 'http://spam' }, 'https://shop.test');
    expect(res.ok).toBe(true);
    expect(await listOrders()).toHaveLength(0);
    expect(calls).toHaveLength(0);
  });
});

describe('settleOrder', () => {
  async function newOrder() {
    const res = await startCheckout({ customer, items }, 'https://shop.test');
    if (!res.ok) throw new Error('setup failed');
    calls.length = 0;
    return res.reference;
  }

  it('marks paid and sends the "payment received" Telegram message exactly once', async () => {
    const ref = await newOrder();
    const a = await settleOrder(ref);
    const b = await settleOrder(ref); // e.g. webhook arrives after the customer's return visit
    expect(a.status).toBe('paid');
    expect(b.status).toBe('paid');
    const msgs = telegramMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('PAYMENT RECEIVED');
    const order = (await getOrder(ref))!;
    expect(order.paymentStatus).toBe('paid');
    expect(order.paystackTransactionId).toBe('99');
    expect(order.telegram.paid).toBe(true);
  });

  it('does not mark paid when Paystack says abandoned', async () => {
    const ref = await newOrder();
    paystackStatus = 'abandoned';
    expect((await settleOrder(ref)).status).toBe('failed');
    expect((await getOrder(ref))!.paymentStatus).toBe('pending');
    expect(telegramMessages()).toHaveLength(0);
  });

  it('rejects a payment whose amount does not match the order', async () => {
    const ref = await newOrder();
    paystackAmount = 100; // GH₵1 paid for a GH₵360 order
    const r = await settleOrder(ref);
    expect(r.status).toBe('failed');
    expect((await getOrder(ref))!.paymentStatus).toBe('failed');
    expect(telegramMessages()[0]).toContain('amount mismatch');
  });

  it('reports unknown references', async () => {
    expect((await settleOrder('SWF-NOPE')).status).toBe('not_found');
  });
});

describe('webhook signature', () => {
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'SWF-X' } });
  it('accepts a correct HMAC-SHA512 signature', async () => {
    const sig = createHmac('sha512', 'sk_test_123').update(body).digest('hex');
    expect(await verifyWebhookSignature(body, sig)).toBe(true);
  });
  it('rejects wrong or missing signatures', async () => {
    expect(await verifyWebhookSignature(body, 'deadbeef')).toBe(false);
    expect(await verifyWebhookSignature(body, null)).toBe(false);
    const forged = createHmac('sha512', 'other_key').update(body).digest('hex');
    expect(await verifyWebhookSignature(body, forged)).toBe(false);
  });
});

describe('admin auth', () => {
  it('checks the password', async () => {
    expect(await checkAdminPassword('letmein')).toBe(true);
    expect(await checkAdminPassword('wrong')).toBe(false);
  });
  it('accepts a fresh token, rejects tampered, expired, and missing ones', async () => {
    const token = await createAdminToken();
    expect(await verifyAdminToken(token)).toBe(true);
    expect(await verifyAdminToken(token.slice(0, -2) + '00')).toBe(false);
    expect(await verifyAdminToken(undefined)).toBe(false);
    expect(await verifyAdminToken(token, Date.now() + 9 * 3600 * 1000)).toBe(false);
  });
  it('is disabled when no password is configured', async () => {
    const token = await createAdminToken();
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(await verifyAdminToken(token)).toBe(false);
    expect(await checkAdminPassword('')).toBe(false);
  });
});
