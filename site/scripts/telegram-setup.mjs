#!/usr/bin/env node
/**
 * Telegram helper.
 *
 *   TELEGRAM_BOT_TOKEN=123:abc node scripts/telegram-setup.mjs
 *       → lists the chats that have messaged your bot, with their chat id.
 *
 *   TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=987654321 node scripts/telegram-setup.mjs
 *       → sends a test message to that chat.
 *
 * Telegram bots cannot message a phone number — they message a chat id. The account must
 * open your bot and press Start once before the bot is allowed to message it.
 */
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN first (create a bot with @BotFather).');
  process.exit(1);
}
const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then((r) => r.json());

if (chatId) {
  const res = await api('sendMessage', { chat_id: chatId, text: '✅ ShapeWearFit: Telegram order alerts are working.' });
  console.log(res.ok ? 'Test message sent — check Telegram.' : `Failed: ${res.description}`);
} else {
  const res = await api('getUpdates');
  if (!res.ok) {
    console.error(`Telegram error: ${res.description}`);
    process.exit(1);
  }
  const chats = new Map();
  for (const u of res.result) {
    const c = (u.message ?? u.edited_message ?? u.my_chat_member)?.chat;
    if (c) chats.set(c.id, c);
  }
  if (chats.size === 0) {
    console.log('No chats yet. Open your bot in Telegram, press Start (or send "hi"), then run this again.');
  } else {
    for (const c of chats.values()) {
      console.log(`TELEGRAM_CHAT_ID=${c.id}   (${[c.first_name, c.last_name].filter(Boolean).join(' ') || c.title || ''}${c.username ? ' @' + c.username : ''})`);
    }
  }
}
