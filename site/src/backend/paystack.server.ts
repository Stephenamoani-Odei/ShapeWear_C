/** Paystack (Ghana · GHS). All calls use the SECRET key and only ever run on the server. */
import { env } from './env.server';

/** PAYSTACK_API_URL is only for automated tests against a fake Paystack. Leave it unset in real use. */
const api = () => env('PAYSTACK_API_URL') ?? 'https://api.paystack.co';

export function paystackConfigured(): boolean {
  return Boolean(env('PAYSTACK_SECRET_KEY'));
}

function secret(): string {
  const key = env('PAYSTACK_SECRET_KEY');
  if (!key) throw new PaystackNotConfiguredError();
  return key;
}

export class PaystackNotConfiguredError extends Error {
  constructor() {
    super('PAYSTACK_SECRET_KEY is not set');
  }
}

export interface PaystackTransaction {
  id: number;
  status: string; // 'success' | 'failed' | 'abandoned' | 'pending' | 'ongoing' ...
  reference: string;
  amount: number; // in pesewas
  currency: string;
  paid_at?: string | null;
}

export async function initializeTransaction(args: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const res = await fetch(`${api()}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountPesewas,
      currency: 'GHS',
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata ?? {},
    }),
    signal: AbortSignal.timeout(15000),
  });
  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  } | null;
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(`Paystack initialize failed (${res.status}): ${json?.message ?? 'no message'}`);
  }
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  const res = await fetch(`${api()}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    signal: AbortSignal.timeout(15000),
  });
  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: PaystackTransaction;
  } | null;
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(`Paystack verify failed (${res.status}): ${json?.message ?? 'no message'}`);
  }
  return json.data;
}

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Paystack signs webhooks with HMAC-SHA512 of the raw body using your secret key. */
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const key = env('PAYSTACK_SECRET_KEY');
  if (!key || !signature) return false;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const expected = toHex(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(rawBody)));
  return timingSafeEqual(expected, signature.toLowerCase());
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
