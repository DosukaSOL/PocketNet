-- v1.2: RetroAchievements link, push tokens, profile privacy lock, profile card border.

-- 1. Profile fields (public): RA username, privacy flag, card border preference.
alter table public.profiles
  add column if not exists ra_username text,
  add column if not exists is_private boolean not null default false,
  add column if not exists card_border text not null default 'classic';

-- 2. Private secrets table for the RetroAchievements web API key. Owner-only read/write.
create table if not exists public.user_secrets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ra_web_api_key text,
  updated_at timestamptz not null default now()
);

alter table public.user_secrets enable row level security;

drop policy if exists "user_secrets_select_own" on public.user_secrets;
create policy "user_secrets_select_own"
  on public.user_secrets for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_secrets_insert_own" on public.user_secrets;
create policy "user_secrets_insert_own"
  on public.user_secrets for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_secrets_update_own" on public.user_secrets;
create policy "user_secrets_update_own"
  on public.user_secrets for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_secrets_delete_own" on public.user_secrets;
create policy "user_secrets_delete_own"
  on public.user_secrets for delete
  to authenticated
  using (user_id = auth.uid());

revoke all on public.user_secrets from anon;
grant select, insert, update, delete on public.user_secrets to authenticated;

-- 3. Push notification tokens. Each device registers; owner-only read/write.
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists push_tokens_user_id_idx on public.push_tokens(user_id);

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_select_own" on public.push_tokens;
create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "push_tokens_insert_own" on public.push_tokens;
create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "push_tokens_update_own" on public.push_tokens;
create policy "push_tokens_update_own"
  on public.push_tokens for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "push_tokens_delete_own" on public.push_tokens;
create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using (user_id = auth.uid());

revoke all on public.push_tokens from anon;
grant select, insert, update, delete on public.push_tokens to authenticated;

-- 4. Visibility helper: can the viewer see the target user's content?
--    Public profiles: always. Private profiles: only self, accepted friends,
--    and active followers.
create or replace function public.can_view_profile(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select not p.is_private
        or p.id = auth.uid()
        or exists (
          select 1 from public.friendships f
          where (f.user_a_id = auth.uid() and f.user_b_id = p.id)
             or (f.user_b_id = auth.uid() and f.user_a_id = p.id)
        )
        or exists (
          select 1 from public.follows fl
          where fl.follower_id = auth.uid() and fl.followee_id = p.id
        )
      from public.profiles p
      where p.id = target_id
    ),
    false
  );
$$;

revoke all on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.can_view_profile(uuid) to authenticated;
