-- RLS + schema helpers for SmartCampus Lost & Found
-- Run in Supabase SQL Editor. Adjust table/bucket names if yours differ.

-- =========================
-- 1) USERS TABLE
-- =========================
-- Ensure `users.id` is uuid and matches auth.users.id
-- (skip if you already have this set up)
-- alter table public.users alter column id type uuid using id::uuid;

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users
for insert
to authenticated
with check (id = auth.uid());

-- Optional: allow users to update their own profile
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- =========================
-- 2) ITEMS TABLE
-- =========================
-- Ensure columns exist
alter table public.items add column if not exists user_id uuid;
alter table public.items add column if not exists map_x double precision;
alter table public.items add column if not exists map_y double precision;
alter table public.items add column if not exists map_zone text;

-- Recommended FK to auth.users
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'items_user_id_fkey'
  ) then
    alter table public.items
      add constraint items_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

alter table public.items enable row level security;

drop policy if exists "items_select_all" on public.items;
create policy "items_select_all"
on public.items
for select
to authenticated
using (true);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own"
on public.items
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own"
on public.items
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- =========================
-- 3) STORAGE BUCKET: items
-- =========================
-- Bucket should be named: items
-- Upload path used by app: items/<userId>/<timestamp>-<filename>

alter table storage.objects enable row level security;

drop policy if exists "items_bucket_read" on storage.objects;
create policy "items_bucket_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'items');

drop policy if exists "items_bucket_upload_own_folder" on storage.objects;
create policy "items_bucket_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'items'
  and (storage.foldername(name))[1] = 'items'
  and (storage.foldername(name))[2] = auth.uid()::text
);

