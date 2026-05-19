-- PocketNet v1.3.1 — DEV badge for @dosuka, per-target notification
-- preferences, RetroAchievements points snapshot, and server-side support for
-- the 'verified' + 'collector' earned badges that v1.3 forgot to register.

-- 1) RetroAchievements points snapshot. We store the hardcore + softcore
--    score returned by `dorequest.php?r=login2` so the achievement total stays
--    visible on the profile even when no Web API key is configured. These are
--    refreshed every time the client re-logs (and via the optional token
--    refresh path).
alter table public.profiles
  add column if not exists ra_points integer,
  add column if not exists ra_softcore_points integer,
  add column if not exists ra_synced_at timestamptz;

-- 2) Per-target notification preferences. For every (viewer, target) pair the
--    viewer can opt into push notifications for the target's posts, comments,
--    new friends/follows, or RetroAchievements unlocks. Defaults are all
--    false; rows only exist when the viewer has explicitly customised them.
create table if not exists public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  notify_posts boolean not null default false,
  notify_achievements boolean not null default false,
  notify_comments boolean not null default false,
  notify_friends boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, target_id)
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notif_prefs_owner_select" on public.notification_preferences;
create policy "notif_prefs_owner_select"
  on public.notification_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "notif_prefs_owner_modify" on public.notification_preferences;
create policy "notif_prefs_owner_modify"
  on public.notification_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) DEV badge — strictly reserved for @dosuka. Cannot be granted via
--    award_badge() at all; only via this dedicated function. The function
--    looks up the *current* user's handle from profiles and refuses the
--    grant unless it matches 'dosuka' (case-insensitive).
create or replace function public.claim_dev_badge()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_handle text;
begin
  if v_user is null then
    return false;
  end if;
  select lower(username) into v_handle from public.profiles where id = v_user;
  if v_handle is null or v_handle <> 'dosuka' then
    return false;
  end if;
  update public.profiles
    set badges = (
          select coalesce(array_agg(distinct b), '{}'::text[])
            from unnest(coalesce(badges, '{}'::text[]) || array['dev']) as b
        ),
        updated_at = now()
    where id = v_user;
  return true;
end;
$$;

revoke all on function public.claim_dev_badge() from public, anon;
grant execute on function public.claim_dev_badge() to authenticated;

-- 4) Refresh award_badge: register 'verified' (any signed-in user with a
--    confirmed email) and 'collector' (3+ favourite handhelds). Explicitly
--    forbid 'dev' from this path so it can never leak.
create or replace function public.award_badge(p_badge text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_post_count integer;
  v_friend_count integer;
  v_community_count integer;
  v_followers integer;
  v_ra_linked boolean;
  v_has_badge boolean;
  v_handheld_count integer;
  v_confirmed timestamptz;
  v_pioneer integer;
begin
  if v_user is null then
    return false;
  end if;

  -- DEV is locked to claim_dev_badge() only.
  if p_badge = 'dev' then
    return false;
  end if;

  -- Already earned? short-circuit
  select p_badge = any(coalesce(badges, '{}'::text[])) into v_has_badge
    from public.profiles where id = v_user;
  if v_has_badge then
    return true;
  end if;

  if p_badge = 'verified' then
    select email_confirmed_at into v_confirmed from auth.users where id = v_user;
    if v_confirmed is null then return false; end if;
  elsif p_badge = 'wordsmith' then
    select count(*) into v_post_count from public.posts where author_id = v_user;
    if v_post_count < 1 then return false; end if;
  elsif p_badge = 'prolific' then
    select count(*) into v_post_count from public.posts where author_id = v_user;
    if v_post_count < 10 then return false; end if;
  elsif p_badge = 'centurion' then
    select count(*) into v_post_count from public.posts where author_id = v_user;
    if v_post_count < 100 then return false; end if;
  elsif p_badge = 'connector' then
    select count(*) into v_friend_count
      from public.friendships
      where user_a_id = v_user or user_b_id = v_user;
    if v_friend_count < 5 then return false; end if;
  elsif p_badge = 'social-butterfly' then
    select count(*) into v_friend_count
      from public.friendships
      where user_a_id = v_user or user_b_id = v_user;
    if v_friend_count < 25 then return false; end if;
  elsif p_badge = 'popular' then
    select count(*) into v_followers from public.follows where followee_id = v_user;
    if v_followers < 10 then return false; end if;
  elsif p_badge = 'influencer' then
    select count(*) into v_followers from public.follows where followee_id = v_user;
    if v_followers < 100 then return false; end if;
  elsif p_badge = 'community-builder' then
    select count(*) into v_community_count
      from public.community_memberships where user_id = v_user;
    if v_community_count < 3 then return false; end if;
  elsif p_badge = 'retro-linked' then
    select (ra_username is not null) into v_ra_linked
      from public.profiles where id = v_user;
    if not coalesce(v_ra_linked, false) then return false; end if;
  elsif p_badge = 'collector' then
    select coalesce(array_length(favorite_handhelds, 1), 0) into v_handheld_count
      from public.profiles where id = v_user;
    if v_handheld_count < 3 then return false; end if;
  elsif p_badge = 'completionist' then
    perform 1 from public.profiles
      where id = v_user
        and bio is not null and length(bio) > 0
        and avatar_url is not null
        and banner_url is not null
        and favorite_handheld is not null;
    if not found then return false; end if;
  elsif p_badge = 'pioneer' then
    select count(*) into v_pioneer
      from public.profiles
      where 'pioneer' = any(badges);
    if v_pioneer >= 200 then return false; end if;
  else
    return false;
  end if;

  update public.profiles
    set badges = array_append(coalesce(badges, '{}'::text[]), p_badge),
        updated_at = now()
    where id = v_user
      and not (p_badge = any(coalesce(badges, '{}'::text[])));

  return true;
end;
$$;

revoke all on function public.award_badge(text) from public, anon;
grant execute on function public.award_badge(text) to authenticated;

-- 5) Backfill: grant OG + DEV to @dosuka so the developer's profile is
--    correctly marked. Idempotent — uses set union so re-running is safe.
update public.profiles
   set badges = (
         select coalesce(array_agg(distinct b), '{}'::text[])
           from unnest(coalesce(badges, '{}'::text[]) || array['og', 'dev']) as b
       ),
       updated_at = now()
 where lower(username) = 'dosuka';
