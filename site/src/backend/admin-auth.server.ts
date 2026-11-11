/**
 * Admin dashboard sign-in: one password (ADMIN_PASSWORD) and a signed, HTTP-only cookie.
 * Uses Web Crypto so it works on Cloudflare Workers and Node alike.
 */
import { env } from './env.server';
import { timingSafeEqual } from './paystack.server';

export const ADMIN_COOKIE = 'swf_admin';
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8; // 8 hours

export function adminConfigured(): boolean {
  return Boolean(env('ADMIN_PASSWORD'));
}

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function sign(payload: string): Promise<string> {
  const secret = env('ADMIN_SESSION_SECRET') ?? env('ADMIN_PASSWORD');
  if (!secret) throw new Error('ADMIN_PASSWORD is not set');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`swf-admin:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  const expected = env('ADMIN_PASSWORD');
  if (!expected) return false;
  // Hash both sides so the comparison is constant-length and constant-time.
  return timingSafeEqual(await sha256Hex(input), await sha256Hex(expected));
}

export async function createAdminToken(now = Date.now()): Promise<string> {
  const expires = now + ADMIN_SESSION_SECONDS * 1000;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifyAdminToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !adminConfigured()) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < now) return false;
  return timingSafeEqual(await sign(expires), signature);
}
