# Supabase Site Settings SQL

Use this script to enable global app settings such as lecture price management from `/admin`.

```sql
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Safe trigger recreation

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.touch_site_settings_updated_at();

alter table public.site_settings enable row level security;

-- Public read (safe for non-sensitive values only)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'Public can read site settings'
  ) then
    create policy "Public can read site settings"
    on public.site_settings
    for select
    using (true);
  end if;
end $$;

-- Management policy placeholder (replace with your auth logic)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'Authenticated can manage site settings'
  ) then
    create policy "Authenticated can manage site settings"
    on public.site_settings
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
  end if;
end $$;

insert into public.site_settings (key, value)
values ('global_lecture_price_inr', '1499')
on conflict (key) do nothing;
```

## Notes
- Keep secret values out of this table.
- Replace demo management policy with stricter admin-role checks in production.
- The app reads/writes key `global_lecture_price_inr`.
