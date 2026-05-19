-- PocketNet v1.3 — Badges system, OG claim (first 50 sign-ups), RA token storage,
-- and UI tidy-up support.

-- 1) Profile badges array. text[] keeps it cheap; badge IDs are validated client-
--    side against a hard-coded catalogue. Default '{}'::text[] so existing rows
--    don't break.
alter table public.profiles
  add column if not exists badges text[] not null default '{}'::text[];

-- 2) Track verified RA accounts via a one-time login token (NOT the user's
--    password — we throw it away as soon as RA returns a Token). Replaces the
--    old "API key only" flow. The token is owner-only and never exposed to
--    anon.
alter table public.user_secrets
  add column if not exists ra_token text,
  add column if not exists ra_username text;

-- 3) `claim_og_badge()` — SECURITY DEFINER function the client calls after
--    sign-up. Awards the 'og' badge only if fewer than 50 profiles currently
--    carry it. Idempotent: a second call by the same user is a no-op.
create or replace function public.claim_og_badge()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
  v_has boolean;
begin
  if v_user is null then
    return false;
  end if;

  -- Already an OG? noop, return true so the client can show the badge.
  select 'og' = any(badges) into v_has from public.profiles where id = v_user;
  if v_has then
    return true;
  end if;

  -- How many OGs already?
  select count(*) into v_count
    from public.profiles
    where 'og' = any(badges);

  if v_count >= 50 then
    return false;
  end if;

  update public.profiles
    set badges = array_append(coalesce(badges, '{}'::text[]), 'og'),
        updated_at = now()
    where id = v_user
      and not ('og' = any(coalesce(badges, '{}'::text[])));

  return true;
end;
$$;

revoke all on function public.claim_og_badge() from public, anon;
grant execute on function public.claim_og_badge() to authenticated;

-- 4) `award_badge(badge_id text)` — SECURITY DEFINER badge granter used by the
--    client for in-app earnable badges. The function validates the badge id
--    against a fixed allow-list AND verifies the corresponding criteria server-
--    side so the client cannot grant arbitrary badges.
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
begin
  if v_user is null then
    return false;
  end if;

  -- Already earned? short-circuit
  select p_badge = any(coalesce(badges, '{}'::text[])) into v_has_badge
    from public.profiles where id = v_user;
  if v_has_badge then
    return true;
  end if;

  -- Per-badge criteria. Each branch must return early with false if the user
  -- doesn't actually meet the criteria — otherwise the badge isn't awarded.
  if p_badge = 'wordsmith' then
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
  elsif p_badge = 'completionist' then
    -- Filled out display name, bio, avatar, banner, handheld
    perform 1 from public.profiles
      where id = v_user
        and bio is not null and length(bio) > 0
        and avatar_url is not null
        and banner_url is not null
        and favorite_handheld is not null;
    if not found then return false; end if;
  elsif p_badge = 'pioneer' then
    -- Same as og — also limited but for first 200 to make it slightly easier
    declare v_pioneer integer;
    begin
      select count(*) into v_pioneer
        from public.profiles
        where 'pioneer' = any(badges);
      if v_pioneer >= 200 then return false; end if;
    end;
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
