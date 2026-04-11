-- Awin transaction sync + per-publisher daily rollup (attribution via go-link slug as clickref)

create table if not exists public.awin_transaction_sync_state (
  id text not null default 'default' primary key,
  last_completed_at timestamptz,
  last_window_end timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

comment on table public.awin_transaction_sync_state is 'Singleton row for last Awin transactions API sync metadata.';

create table if not exists public.awin_transactions (
  awin_transaction_id text not null primary key,
  advertiser_id bigint,
  commission_status text,
  commission_amount numeric(18, 6) not null default 0,
  commission_currency text not null default 'GBP',
  sale_amount numeric(18, 6) not null default 0,
  sale_currency text not null default 'GBP',
  transaction_date timestamptz not null,
  click_ref text,
  publisher_id uuid references public.profiles (id) on delete set null,
  go_link_slug text,
  synced_at timestamptz not null default now()
);

create index if not exists awin_transactions_publisher_date_idx
  on public.awin_transactions (publisher_id, transaction_date desc);

create index if not exists awin_transactions_date_idx
  on public.awin_transactions (transaction_date desc);

create index if not exists awin_transactions_click_ref_idx
  on public.awin_transactions (click_ref)
  where click_ref is not null;

comment on table public.awin_transactions is 'Publisher transactions from Awin API; publisher_id resolved via publisher_go_links.slug = click_ref.';

create table if not exists public.publisher_earnings_daily (
  publisher_id uuid not null references public.profiles (id) on delete cascade,
  earn_date date not null,
  currency text not null,
  commission_total numeric(18, 6) not null default 0,
  sale_total numeric(18, 6) not null default 0,
  txn_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (publisher_id, earn_date, currency)
);

create index if not exists publisher_earnings_daily_date_idx
  on public.publisher_earnings_daily (earn_date desc);

comment on table public.publisher_earnings_daily is 'Aggregated from awin_transactions for fast dashboard reads.';

create or replace function public.refresh_publisher_earnings_daily()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate table public.publisher_earnings_daily;
  insert into public.publisher_earnings_daily (
    publisher_id, earn_date, currency, commission_total, sale_total, txn_count
  )
  select
    t.publisher_id,
    (t.transaction_date at time zone 'UTC')::date as earn_date,
    t.commission_currency,
    sum(t.commission_amount)::numeric(18, 6),
    sum(t.sale_amount)::numeric(18, 6),
    count(*)::int
  from public.awin_transactions t
  where t.publisher_id is not null
  group by t.publisher_id, (t.transaction_date at time zone 'UTC')::date, t.commission_currency;
end;
$$;

grant execute on function public.refresh_publisher_earnings_daily() to service_role;

alter table public.awin_transaction_sync_state enable row level security;
alter table public.awin_transactions enable row level security;
alter table public.publisher_earnings_daily enable row level security;

-- No anon/authenticated direct access; server uses service role.

notify pgrst, 'reload schema';
