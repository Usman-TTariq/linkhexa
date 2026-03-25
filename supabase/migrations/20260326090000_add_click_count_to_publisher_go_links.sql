-- Adds per-link click counts for publisher dashboards.
-- We increment the counter every time /go/short/{slug} is visited.

alter table public.publisher_go_links
add column if not exists click_count bigint not null default 0;

-- Atomic increment helper (used by the public redirect route).
create or replace function public.increment_publisher_go_link_click(p_slug text)
returns bigint
language plpgsql
security definer
as $$
declare v bigint;
begin
  update public.publisher_go_links
  set click_count = click_count + 1
  where slug = p_slug
  returning click_count into v;

  return v;
end;
$$;

