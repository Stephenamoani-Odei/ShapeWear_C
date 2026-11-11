import { createFileRoute } from '@tanstack/react-router';
import { settleOrder } from '@/backend/checkout-service.server';
import { verifyWebhookSignature } from '@/backend/paystack.server';

/**
 * Paystack webhook — a safety net for customers who pay but close the tab before returning.
 * In your Paystack dashboard (Settings → API Keys & Webhooks) set the Webhook URL to:
 *   https://YOUR-DOMAIN/api/paystack-webhook
 */
export const Route = createFileRoute('/api/paystack-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const valid = await verifyWebhookSignature(raw, request.headers.get('x-paystack-signature'));
        if (!valid) return new Response('Invalid signature', { status: 401 });

        try {
          const event = JSON.parse(raw) as { event?: string; data?: { reference?: string; status?: string; id?: number; amount?: number; currency?: string; paid_at?: string | null } };
          if (event.event === 'charge.success' && event.data?.reference) {
            // Re-verify with Paystack instead of trusting the payload alone.
            await settleOrder(event.data.reference);
          }
        } catch (error) {
          console.error('[webhook] processing error', error);
          // Still 200 so Paystack does not retry forever on a bad payload.
        }
        return new Response('ok', { status: 200 });
      },
    },
  },
});
