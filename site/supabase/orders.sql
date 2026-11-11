-- Run this once in Supabase → SQL Editor.
create table if not exists public.orders (
  reference      text primary key,
  created_at     timestamptz not null default now(),
  payment_status text not null default 'pending',
  fulfilment     text not null default 'new',
  data           jsonb not null
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Lock the table down: only the server (service-role key) can read/write it.
-- No policies are created on purpose, so the public/anon key can never see customer details.
alter table public.orders enable row level security;
