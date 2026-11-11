import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { env } from './env.server';
import { settleOrder, startCheckout, type SettleStatus } from './checkout-service.server';

function siteOrigin(): string {
  const configured = env('SITE_URL');
  if (configured) return configured.replace(/\/$/, '');
  return new URL(getRequest().url).origin;
}

/** Called by the checkout form. Returns the Paystack page to send the customer to. */
export const startCheckoutFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => startCheckout(data, siteOrigin()));

export interface PublicOrderStatus {
  status: SettleStatus;
  reference?: string;
  customerName?: string;
  subtotal?: number;
  items?: Array<{ name: string; size: string; fit?: string | undefined; quantity: number; lineTotal: number }>;
}

/** Called by the page Paystack sends the customer back to. */
export const verifyPaymentFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ reference: z.string().min(4).max(64) }).parse(data))
  .handler(async ({ data }): Promise<PublicOrderStatus> => {
    const { status, order } = await settleOrder(data.reference);
    if (!order) return { status };
    // Only return what the confirmation page needs — never the address or phone.
    return {
      status,
      reference: order.reference,
      customerName: order.customer.fullName,
      subtotal: order.subtotal,
      items: order.items.map((i) => ({ name: i.name, size: i.size, fit: i.fit, quantity: i.quantity, lineTotal: i.lineTotal })),
    };
  });
