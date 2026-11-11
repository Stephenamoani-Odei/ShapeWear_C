/**
 * Telegram notifications to the store owner.
 *
 * NOTE: the Telegram Bot API cannot message a phone number. It needs a bot token
 * (TELEGRAM_BOT_TOKEN, from @BotFather) and the numeric chat id of the account that
 * should receive messages (TELEGRAM_CHAT_ID). See README → "Telegram setup".
 */
import { env } from './env.server';
import { formatGHS } from '../lib/money';
import { toInternationalPhone } from '../lib/checkout-schema';
import type { Order } from './orders.server';

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function telegramConfigured(): boolean {
  return Boolean(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID'));
}

/** Sends a message; never throws. Returns true only if Telegram accepted it. */
export async function sendTelegram(html: string): Promise<boolean> {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — notification skipped');
    return false;
  }
  try {
    const res = await fetch(`${env('TELEGRAM_API_URL') ?? 'https://api.telegram.org'}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html.slice(0, 4000),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage failed', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (error) {
    console.error('[telegram] sendMessage error', error);
    return false;
  }
}

export function formatOrderMessage(order: Order, kind: 'checkout' | 'paid'): string {
  const wa = `https://wa.me/${toInternationalPhone(order.customer.phone)}`;
  const site = env('SITE_URL')?.replace(/\/$/, '');
  const lines: string[] = [];

  lines.push(
    kind === 'paid'
      ? '✅ <b>PAYMENT RECEIVED</b> — ShapeWearFit'
      : '🛒 <b>NEW CHECKOUT</b> — awaiting payment'
  );
  lines.push(`Order: <code>${esc(order.reference)}</code>`);
  lines.push('');
  lines.push(`👤 <b>${esc(order.customer.fullName)}</b>`);
  lines.push(`📞 ${esc(order.customer.phone)} · <a href="${wa}">WhatsApp</a>`);
  lines.push(`✉️ ${esc(order.customer.email)}`);
  lines.push('');
  lines.push('📍 <b>Delivery details</b>');
  lines.push(esc(order.delivery.address));
  lines.push(`${esc(order.delivery.city)}, ${esc(order.delivery.region)}`);
  if (order.delivery.landmark) lines.push(`Landmark: ${esc(order.delivery.landmark)}`);
  if (order.delivery.digitalAddress) lines.push(`GPS: ${esc(order.delivery.digitalAddress)}`);
  lines.push('');
  lines.push('🧾 <b>Items</b>');
  for (const it of order.items) {
    lines.push(`• ${it.quantity} × ${esc(it.name)} — size <b>${esc(it.size)}</b>${it.fit ? `, <b>${esc(it.fit)}</b>` : ''} — ${formatGHS(it.lineTotal)}`);
  }
  lines.push('');
  lines.push(`💰 Subtotal: <b>${formatGHS(order.subtotal)}</b>`);
  lines.push(
    kind === 'paid'
      ? '🚚 Delivery fee: <b>not yet agreed — contact the customer</b>'
      : '🚚 Delivery fee: to be confirmed with the customer'
  );
  if (order.notes) {
    lines.push('');
    lines.push(`📝 Note: ${esc(order.notes)}`);
  }
  if (site) {
    lines.push('');
    lines.push(`<a href="${site}/admin">Open admin dashboard</a>`);
  }
  return lines.join('\n');
}
