-- Lita's Jalapeño Poppers — order logging database
-- Run this once in Supabase → SQL Editor → New query

create extension if not exists pgcrypto;

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text,
  fulfillment text,
  notes text,
  language text,
  total numeric(10,2) not null
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id text not null,
  item_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null,
  line_total numeric(10,2) not null
);

-- Lock both tables down: the public website (using the "anon" key)
-- may only INSERT new rows. It cannot read, edit, or delete anything —
-- so a customer's order can never be seen or tampered with by another
-- visitor. Only someone logged into the Supabase dashboard can browse
-- the data (via Table Editor), which bypasses these policies.
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Public can insert orders"
  on orders for insert
  to anon
  with check (true);

create policy "Public can insert order_items"
  on order_items for insert
  to anon
  with check (true);
