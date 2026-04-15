# Secure Supabase Admin SQL

Run this after you create the doctor/admin account in Supabase Auth.

```sql
create extension if not exists pgcrypto;

-- -----------------------------------------------------
-- Admin allow-list
-- -----------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_read_own" on public.admin_users;
drop policy if exists "admin_users_manage_own" on public.admin_users;

create policy "admin_users_read_own"
on public.admin_users
for select
using (auth.uid() = user_id);

create policy "admin_users_manage_own"
on public.admin_users
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------
-- lectures
-- public read, admin-only writes
-- -----------------------------------------------------
create table if not exists public.lectures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date text not null,
  time text not null,
  duration_minutes integer not null,
  speaker text not null,
  category text not null,
  seats_available integer not null default 0,
  total_seats integer not null default 0,
  location text not null,
  image_url text,
  price_inr numeric,
  is_live boolean not null default false,
  meeting_room text,
  live_started_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.lectures enable row level security;

drop policy if exists "lectures_select" on public.lectures;
drop policy if exists "lectures_insert" on public.lectures;
drop policy if exists "lectures_update" on public.lectures;
drop policy if exists "lectures_delete" on public.lectures;

create policy "lectures_select"
on public.lectures
for select
using (true);

create policy "lectures_insert"
on public.lectures
for insert
with check (public.is_admin_user());

create policy "lectures_update"
on public.lectures
for update
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "lectures_delete"
on public.lectures
for delete
using (public.is_admin_user());

alter table public.lectures replica identity full;

-- -----------------------------------------------------
-- site_settings
-- public read, admin-only writes
-- -----------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
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

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.touch_site_settings_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select" on public.site_settings;
drop policy if exists "site_settings_insert" on public.site_settings;
drop policy if exists "site_settings_update" on public.site_settings;
drop policy if exists "site_settings_delete" on public.site_settings;

create policy "site_settings_select"
on public.site_settings
for select
using (true);

create policy "site_settings_insert"
on public.site_settings
for insert
with check (public.is_admin_user());

create policy "site_settings_update"
on public.site_settings
for update
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "site_settings_delete"
on public.site_settings
for delete
using (public.is_admin_user());

insert into public.site_settings (key, value)
values ('global_lecture_price_inr', '1499')
on conflict (key) do nothing;

-- -----------------------------------------------------
-- blocked_time_slots
-- public read, admin-only writes
-- -----------------------------------------------------
create table if not exists public.blocked_time_slots (
  id uuid primary key default gen_random_uuid(),
  date_iso text not null,
  time text not null,
  reason text,
  created_at timestamptz default now(),
  unique (date_iso, time)
);

alter table public.blocked_time_slots enable row level security;

drop policy if exists "blocked_slots_select" on public.blocked_time_slots;
drop policy if exists "blocked_slots_insert" on public.blocked_time_slots;
drop policy if exists "blocked_slots_update" on public.blocked_time_slots;
drop policy if exists "blocked_slots_delete" on public.blocked_time_slots;

create policy "blocked_slots_select"
on public.blocked_time_slots
for select
using (true);

create policy "blocked_slots_insert"
on public.blocked_time_slots
for insert
with check (public.is_admin_user());

create policy "blocked_slots_update"
on public.blocked_time_slots
for update
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "blocked_slots_delete"
on public.blocked_time_slots
for delete
using (public.is_admin_user());

alter table public.blocked_time_slots replica identity full;

-- -----------------------------------------------------
-- reviews
-- public can submit and read approved only, admin can moderate
-- -----------------------------------------------------
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
drop policy if exists "reviews_insert" on public.reviews;
drop policy if exists "reviews_update" on public.reviews;
drop policy if exists "reviews_delete" on public.reviews;

create policy "reviews_select"
on public.reviews
for select
using (is_approved = true or public.is_admin_user());

create policy "reviews_insert"
on public.reviews
for insert
with check (true);

create policy "reviews_update"
on public.reviews
for update
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "reviews_delete"
on public.reviews
for delete
using (public.is_admin_user());

alter table public.reviews replica identity full;

-- -----------------------------------------------------
-- realtime
-- -----------------------------------------------------
alter publication supabase_realtime add table public.lectures;
alter publication supabase_realtime add table public.site_settings;
alter publication supabase_realtime add table public.blocked_time_slots;
alter publication supabase_realtime add table public.reviews;

-- -----------------------------------------------------
-- After creating the admin user in Supabase Auth,
-- insert the user's UUID into admin_users.
-- -----------------------------------------------------
-- insert into public.admin_users (user_id)
-- values ('00000000-0000-0000-0000-000000000000');
```

## What this does

- Lets anyone read the public lecture schedule and approved reviews.
- Lets only authenticated admin users manage lectures, pricing, blocked slots, and moderation.
- Keeps the frontend working with the anon key while RLS protects writes.