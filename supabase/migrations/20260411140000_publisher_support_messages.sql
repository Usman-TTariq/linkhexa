-- In-dashboard publisher ↔ staff support thread (API uses service role + session checks)

create table if not exists public.publisher_support_messages (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  sender text not null check (sender in ('publisher', 'staff')),
  created_at timestamptz not null default now()
);

create index if not exists publisher_support_messages_pub_created_idx
  on public.publisher_support_messages (publisher_id, created_at desc);

comment on table public.publisher_support_messages is 'Support chat messages; publisher sends via /api/publisher/support-messages, staff via admin API.';

alter table public.publisher_support_messages enable row level security;

-- No direct client access; Next.js API uses service role.

notify pgrst, 'reload schema';
