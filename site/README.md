# ShapeWearFit — online store (Accra, Ghana)

Office-standard long-sleeve shirts and jerseys. Customers choose a **size only**, fill in a checkout
form (contact + delivery details), and pay with **Paystack**. Each order appears in the **admin
dashboard** and a message is sent to your **Telegram**. Delivery is **not** charged online — you contact
the customer with the delivery price afterwards.

```sh
npm install
cp .env.example .env     # then fill it in (see below)
npm run dev
```

## How an order flows

1. Customer adds items (size only; long-sleeve shirts also need **Custom Fit** or **Slim Fit**) → **Proceed to Checkout** → fills the form → **Pay with Paystack**.
2. The server rebuilds the price from `src/app/data/products.ts` (the browser can't change what is charged),
   saves the order as *awaiting payment*, and sends you a **"NEW CHECKOUT"** Telegram message.
3. Customer pays on Paystack and returns to `/order-confirmation`. The server asks Paystack to confirm the
   payment, marks the order **Paid** and sends a **"PAYMENT RECEIVED"** Telegram message (once only).
4. A Paystack webhook does the same if the customer pays and closes the tab.
5. You open `/admin`, contact the customer (WhatsApp / call buttons), record the agreed delivery fee and
   move the order through *Customer contacted → Dispatched → Delivered*.

## Setup (all values go in `.env` locally, and in your host's environment/secrets settings online)

| Variable | What it is |
|---|---|
| `PAYSTACK_SECRET_KEY` | Paystack dashboard → Settings → API Keys. Use `sk_test_…` first, `sk_live_…` when ready. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | See *Telegram setup*. |
| `ADMIN_PASSWORD` | Password for `/admin` (choose a long one). |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Permanent order storage, see *Order storage*. |
| `SITE_URL` | Your public address, e.g. `https://www.shapewearfit.com` (no trailing slash). |

**Paystack webhook:** Paystack dashboard → Settings → API Keys & Webhooks → set *Webhook URL* to
`https://YOUR-DOMAIN/api/paystack-webhook`.

### Telegram setup
Telegram bots cannot message a phone number (such as 0554553214); they message a **chat id**. One-time setup:
1. In Telegram, message **@BotFather** → `/newbot` → copy the token into `TELEGRAM_BOT_TOKEN`.
2. Open your new bot from the Telegram account on 0554553214 and press **Start**.
3. Run `TELEGRAM_BOT_TOKEN=<token> node scripts/telegram-setup.mjs` → it prints `TELEGRAM_CHAT_ID=…`. Put that in `.env`.
4. Run the same command with `TELEGRAM_CHAT_ID=<id>` added to send yourself a test message.

### Order storage
Without Supabase, orders live only in memory and **disappear on restart** (the dashboard warns you).
Create a free Supabase project, run `supabase/orders.sql` in its SQL Editor, then set `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. The key is used only on the server; the table is locked to the public.

## Editing the shop
- **Products, prices (GH₵), sizes, shirt fits:** `src/app/data/products.ts`. Prices in the file are placeholders.
- **Phone / WhatsApp / Snapchat:** `src/lib/store-info.ts`.
- **Admin dashboard:** `/admin` (not linked anywhere on the public site, and hidden from search engines).

## Tests
`npm test` — covers pricing, Paystack verification, one-time notifications, webhook signature and admin login.
