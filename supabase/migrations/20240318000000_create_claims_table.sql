-- Create claims table
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  item_id uuid not null references public.items(id) on delete cascade,
  claimer_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists claims_item_id_idx on public.claims(item_id);
create index if not exists claims_claimer_id_idx on public.claims(claimer_id);
create index if not exists claims_status_idx on public.claims(status);

-- Enable RLS
alter table public.claims enable row level security;

-- Policies
-- Users can insert their own claims
create policy "Users can insert own claims"
  on public.claims for insert
  with check (auth.uid() = claimer_id);

-- Users can view claims on items they own or claims they made
create policy "Users can view relevant claims"
  on public.claims for select
  using (
    auth.uid() = claimer_id
    or
    auth.uid() in (
      select owner_id from public.items where id = claims.item_id
    )
  );

-- Item owners can update claim status
create policy "Item owners can update claim status"
  on public.claims for update
  using (
    auth.uid() in (
      select owner_id from public.items where id = claims.item_id
    )
  )
  with check (
    auth.uid() in (
      select owner_id from public.items where id = claims.item_id
    )
  );
