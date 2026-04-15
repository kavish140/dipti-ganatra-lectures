# Supabase Live Lectures SQL

Run this in Supabase SQL Editor to support admin-controlled live sessions.

```sql
alter table public.lectures
  add column if not exists is_live boolean not null default false,
  add column if not exists meeting_room text,
  add column if not exists live_started_at timestamptz;

create index if not exists idx_lectures_is_live on public.lectures(is_live);

update public.lectures
set is_live = false
where is_live is null;
```

## Optional hardening
- Add stricter RLS to allow only admins to update `is_live`, `meeting_room`, and `live_started_at`.
- Keep public `select` so attendees can detect active sessions.
