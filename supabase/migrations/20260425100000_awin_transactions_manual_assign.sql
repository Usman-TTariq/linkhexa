-- Manual admin assignment for unattributed Awin rows; sync must preserve these.

alter table public.awin_transactions
  add column if not exists manually_assigned_at timestamptz,
  add column if not exists manually_assigned_by uuid references public.profiles (id) on delete set null;

comment on column public.awin_transactions.manually_assigned_at is 'When set, sync must not overwrite publisher_id / click_ref / go_link_slug from Awin.';
comment on column public.awin_transactions.manually_assigned_by is 'Profile id of the assigner when using authenticated admin; optional for cookie-only admin.';

create index if not exists awin_transactions_lost_publisher_idx
  on public.awin_transactions (transaction_date desc)
  where publisher_id is null;

notify pgrst, 'reload schema';
