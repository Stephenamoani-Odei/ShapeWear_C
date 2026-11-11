import { createServerFn } from '@tanstack/react-start';
import { deleteCookie, getCookie, getRequest, setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  adminConfigured,
  checkAdminPassword,
  createAdminToken,
  verifyAdminToken,
} from './admin-auth.server';
import { getOrder, listOrders, saveOrder, storageMode, type Fulfilment, type Order } from './orders.server';
import { telegramConfigured } from './telegram.server';
import { paystackConfigured } from './paystack.server';

async function requireAdmin() {
  if (!(await verifyAdminToken(getCookie(ADMIN_COOKIE)))) {
    throw new Error('Not signed in');
  }
}

export interface AdminSession {
  configured: boolean;
  authed: boolean;
  storage: 'supabase' | 'memory';
  telegram: boolean;
  paystack: boolean;
}

export const adminSessionFn = createServerFn({ method: 'GET' }).handler(async (): Promise<AdminSession> => ({
  configured: adminConfigured(),
  authed: await verifyAdminToken(getCookie(ADMIN_COOKIE)),
  storage: storageMode(),
  telegram: telegramConfigured(),
  paystack: paystackConfigured(),
}));

let failedAttempts = 0;
let lockedUntil = 0;

export const adminLoginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ password: z.string().max(200) }).parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    if (!adminConfigured()) return { ok: false, error: 'Admin is not set up yet. Add ADMIN_PASSWORD in your environment settings.' };
    // Basic brute-force slow-down (best effort — per server instance)
    if (Date.now() < lockedUntil) return { ok: false, error: 'Too many attempts. Please wait a minute and try again.' };

    if (!(await checkAdminPassword(data.password))) {
      failedAttempts += 1;
      if (failedAttempts >= 5) {
        lockedUntil = Date.now() + 60_000;
        failedAttempts = 0;
      }
      await new Promise((r) => setTimeout(r, 600));
      return { ok: false, error: 'Incorrect password.' };
    }

    failedAttempts = 0;
    setCookie(ADMIN_COOKIE, await createAdminToken(), {
      httpOnly: true,
      secure: new URL(getRequest().url).protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return { ok: true };
  });

export const adminLogoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(ADMIN_COOKIE, { path: '/' });
  return { ok: true };
});

export const adminOrdersFn = createServerFn({ method: 'GET' }).handler(async (): Promise<Order[]> => {
  await requireAdmin();
  return listOrders();
});

const FULFILMENTS = ['new', 'contacted', 'dispatched', 'delivered', 'cancelled'] as const;

export const adminUpdateOrderFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        reference: z.string().min(4).max(64),
        fulfilment: z.enum(FULFILMENTS).optional(),
        adminNote: z.string().max(1000).optional(),
        deliveryFee: z.number().min(0).max(100000).nullable().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }): Promise<Order> => {
    await requireAdmin();
    const order = await getOrder(data.reference);
    if (!order) throw new Error('Order not found');
    if (data.fulfilment) order.fulfilment = data.fulfilment as Fulfilment;
    if (data.adminNote !== undefined) order.adminNote = data.adminNote;
    if (data.deliveryFee !== undefined) order.deliveryFee = data.deliveryFee;
    await saveOrder(order);
    return order;
  });
