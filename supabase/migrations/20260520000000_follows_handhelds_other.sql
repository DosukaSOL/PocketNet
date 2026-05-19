-- v1.1 — follow system, multi-handheld profiles, custom "other" entries,
-- and a username availability RPC for friendly signup errors.

-- =========================================================================
-- profiles: favorite_handhelds array + free-text "other" entries
-- =========================================================================

alter table public.profiles
  add column if not exists favorite_handhelds text[] not null default '{}';

alter table public.profiles
  add column if not exists custom_handhelds text[] not null default '{}';

alter table public.profiles
  add column if not exists custom_frontends text[] not null default '{}';

alter table public.profiles
  add column if not exists custom_systems text[] not null default '{}';

alter table public.profiles
  add column if not exists custom_games text[] not null default '{}';

-- backfill: copy the existing single favorite_handheld into the new array so
-- existing users don't lose their pick.
update public.profiles
  set favorite_handhelds = array[favorite_handheld]
  where favorite_handheld is not null
    and (favorite_handhelds is null or array_length(favorite_handhelds, 1) is null);

-- =========================================================================
-- username availability RPC (anon-callable, public usernames only)
-- =========================================================================

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username)
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- =========================================================================
-- follows: one-way "I follow you" relationships, independent of friendships
-- =========================================================================

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx
  on public.follows (followee_id, created_at desc);
create index if not exists follows_follower_idx
  on public.follows (follower_id, created_at desc);

alter table public.follows enable row level security;

-- Anyone authenticated can read follow edges (public-ish social graph).
drop policy if exists "follows are readable" on public.follows;
create policy "follows are readable"
  on public.follows
  for select
  using (auth.uid() is not null);

-- A user can only create follow rows where they are the follower.
drop policy if exists "user can follow as self" on public.follows;
create policy "user can follow as self"
  on public.follows
  for insert
  with check (
    follower_id = auth.uid()
    and follower_id <> followee_id
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = follower_id and b.blocked_id = followee_id)
         or (b.blocker_id = followee_id and b.blocked_id = follower_id)
    )
  );

-- A user can only delete their own follow rows.
drop policy if exists "user can unfollow as self" on public.follows;
create policy "user can unfollow as self"
  on public.follows
  for delete
  using (follower_id = auth.uid());
