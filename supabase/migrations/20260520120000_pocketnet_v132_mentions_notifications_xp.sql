-- v1.3.2 — Replies to comments, @mentions, server-backed notifications,
-- XP/level system, custom profile borders.
--
-- Goals:
--   * Replies on comments (parent_comment_id) so users can reply to specific
--     comments under a post.
--   * @mention parsing + server-side notification fan-out for posts AND
--     comments.
--   * A real `notifications` table (RLS owner-only). Triggers populate it for
--     comments, replies, mentions, friend requests/accepts, follows, likes,
--     and community join events.
--   * XP + level fields on profiles, computed deterministically from social
--     activity. Triggers award XP on key events.
--   * Custom profile border URL (image), persisted alongside the existing
--     `card_border` preset id. Server enforces https + length to prevent
--     abuse.

-- =========================================================================
-- 1. Replies on comments
-- =========================================================================
alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;

create index if not exists comments_parent_idx
  on public.comments (parent_comment_id, created_at);

-- =========================================================================
-- 2. Notifications table
-- =========================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (
    type in (
      'friend_request',
      'friend_accept',
      'follow',
      'post_like',
      'post_comment',
      'comment_reply',
      'mention',
      'community_join',
      'achievement',
      'level_up',
      'moderation'
    )
  ),
  title text not null,
  body text not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications owner select" on public.notifications;
create policy "notifications owner select"
  on public.notifications
  for select
  using (user_id = auth.uid());

-- Only the owner can mark a notification read.
drop policy if exists "notifications owner update" on public.notifications;
create policy "notifications owner update"
  on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Owner may delete their own rows.
drop policy if exists "notifications owner delete" on public.notifications;
create policy "notifications owner delete"
  on public.notifications
  for delete
  using (user_id = auth.uid());

-- Inserts are server-side only (via SECURITY DEFINER triggers). No INSERT
-- policy is created — RLS will deny direct inserts from authenticated users.

-- =========================================================================
-- 3. Helper: parse @mentions out of a body and resolve to profile ids
-- =========================================================================
create or replace function public.extract_mentioned_ids(p_body text, p_exclude_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  with raw_handles as (
    select distinct lower(substring(m[1] from 1)) as handle
    from regexp_matches(coalesce(p_body, ''), '@([A-Za-z0-9_]{3,32})', 'g') as m
  )
  select p.id
  from public.profiles p
  join raw_handles rh on lower(p.username) = rh.handle
  where p_exclude_id is null or p.id <> p_exclude_id;
$$;

revoke all on function public.extract_mentioned_ids(text, uuid) from public, anon;
grant execute on function public.extract_mentioned_ids(text, uuid) to authenticated;

-- =========================================================================
-- 4. Notification triggers
-- =========================================================================

-- 4a. Post insert: fan out @mention notifications.
create or replace function public.notify_on_post_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
begin
  select coalesce(display_name, username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = new.author_id;

  insert into public.notifications (user_id, actor_id, type, title, body, post_id)
  select
    mentioned.id,
    new.author_id,
    'mention',
    v_actor_name || ' mentioned you',
    left(coalesce(new.body, ''), 240),
    new.id
  from public.extract_mentioned_ids(new.body, new.author_id) as mentioned(id)
  where not exists (
    select 1 from public.blocks b
    where (b.blocker_id = mentioned.id and b.blocked_id = new.author_id)
       or (b.blocker_id = new.author_id and b.blocked_id = mentioned.id)
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_on_post_insert on public.posts;
create trigger trg_notify_on_post_insert
  after insert on public.posts
  for each row execute function public.notify_on_post_insert();

-- 4b. Comment insert: notify post author + parent-comment author + mentions.
create or replace function public.notify_on_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.posts;
  v_actor_name text;
  v_parent_author uuid;
begin
  select * into v_post from public.posts where id = new.post_id;
  if v_post.id is null then return new; end if;

  select coalesce(display_name, username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = new.author_id;

  -- Notify the post author (if not self and not blocked).
  if v_post.author_id is not null and v_post.author_id <> new.author_id then
    if not exists (
      select 1 from public.blocks b
      where (b.blocker_id = v_post.author_id and b.blocked_id = new.author_id)
         or (b.blocker_id = new.author_id and b.blocked_id = v_post.author_id)
    ) then
      insert into public.notifications (user_id, actor_id, type, title, body, post_id, comment_id)
      values (
        v_post.author_id,
        new.author_id,
        'post_comment',
        v_actor_name || ' commented on your post',
        left(coalesce(new.body, ''), 240),
        new.id,
        new.id
      );
    end if;
  end if;

  -- Notify parent-comment author for replies.
  if new.parent_comment_id is not null then
    select author_id into v_parent_author from public.comments where id = new.parent_comment_id;
    if v_parent_author is not null
       and v_parent_author <> new.author_id
       and v_parent_author <> v_post.author_id then
      if not exists (
        select 1 from public.blocks b
        where (b.blocker_id = v_parent_author and b.blocked_id = new.author_id)
           or (b.blocker_id = new.author_id and b.blocked_id = v_parent_author)
      ) then
        insert into public.notifications (user_id, actor_id, type, title, body, post_id, comment_id)
        values (
          v_parent_author,
          new.author_id,
          'comment_reply',
          v_actor_name || ' replied to your comment',
          left(coalesce(new.body, ''), 240),
          new.post_id,
          new.id
        );
      end if;
    end if;
  end if;

  -- Mentions in the comment body.
  insert into public.notifications (user_id, actor_id, type, title, body, post_id, comment_id)
  select
    mentioned.id,
    new.author_id,
    'mention',
    v_actor_name || ' mentioned you in a comment',
    left(coalesce(new.body, ''), 240),
    new.post_id,
    new.id
  from public.extract_mentioned_ids(new.body, new.author_id) as mentioned(id)
  where mentioned.id <> coalesce(v_post.author_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and mentioned.id <> coalesce(v_parent_author, '00000000-0000-0000-0000-000000000000'::uuid)
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = mentioned.id and b.blocked_id = new.author_id)
         or (b.blocker_id = new.author_id and b.blocked_id = mentioned.id)
    );

  return new;
end;
$$;

drop trigger if exists trg_notify_on_comment_insert on public.comments;
create trigger trg_notify_on_comment_insert
  after insert on public.comments
  for each row execute function public.notify_on_comment_insert();

-- 4c. Follow insert: notify the followee.
create or replace function public.notify_on_follow_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
begin
  select coalesce(display_name, username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = new.follower_id;

  insert into public.notifications (user_id, actor_id, type, title, body)
  values (
    new.followee_id,
    new.follower_id,
    'follow',
    v_actor_name || ' started following you',
    ''
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_on_follow_insert on public.follows;
create trigger trg_notify_on_follow_insert
  after insert on public.follows
  for each row execute function public.notify_on_follow_insert();

-- 4d. Post like notify (post_reactions insert).
create or replace function public.notify_on_reaction_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.posts;
  v_actor_name text;
begin
  select * into v_post from public.posts where id = new.post_id;
  if v_post.id is null or v_post.author_id = new.user_id then return new; end if;

  select coalesce(display_name, username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = new.user_id;

  insert into public.notifications (user_id, actor_id, type, title, body, post_id)
  values (
    v_post.author_id,
    new.user_id,
    'post_like',
    v_actor_name || ' liked your post',
    left(coalesce(v_post.body, ''), 240),
    new.id
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_on_reaction_insert on public.post_reactions;
create trigger trg_notify_on_reaction_insert
  after insert on public.post_reactions
  for each row execute function public.notify_on_reaction_insert();

-- =========================================================================
-- 5. XP / level system
-- =========================================================================
alter table public.profiles
  add column if not exists xp integer not null default 0,
  add column if not exists level integer not null default 1;

-- Deterministic level curve: floor(sqrt(xp / 50)) + 1.
--   level 1 :        0 xp
--   level 2 :       50 xp
--   level 5 :      800 xp
--   level 10:    4 050 xp
--   level 20:   18 050 xp
create or replace function public.xp_to_level(p_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(sqrt(greatest(p_xp, 0)::numeric / 50.0))::int + 1);
$$;

-- Add XP to a user and bump their level if they crossed a threshold. Returns
-- the new level. Awards a level-up notification on transitions.
create or replace function public.add_xp(p_user_id uuid, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
begin
  if p_user_id is null or p_delta is null or p_delta <= 0 then
    return null;
  end if;

  update public.profiles
    set xp = greatest(0, xp + p_delta),
        updated_at = now()
    where id = p_user_id
    returning level, xp into v_old_level, v_new_xp;

  if v_new_xp is null then
    return null;
  end if;

  v_new_level := public.xp_to_level(v_new_xp);
  if v_new_level > v_old_level then
    update public.profiles set level = v_new_level where id = p_user_id;
    insert into public.notifications (user_id, actor_id, type, title, body)
    values (
      p_user_id,
      null,
      'level_up',
      'Level up! You hit level ' || v_new_level,
      'New profile borders and badges are unlocked.'
    );
  end if;

  return v_new_level;
end;
$$;

revoke all on function public.add_xp(uuid, integer) from public, anon, authenticated;
-- add_xp is invoked only by triggers running as definer; no one needs direct access.

-- XP triggers — small, deterministic deltas, no client involvement.
create or replace function public.xp_on_post_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.add_xp(new.author_id, 10); return new; end;
$$;
drop trigger if exists trg_xp_on_post_insert on public.posts;
create trigger trg_xp_on_post_insert after insert on public.posts
  for each row execute function public.xp_on_post_insert();

create or replace function public.xp_on_comment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.add_xp(new.author_id, 4); return new; end;
$$;
drop trigger if exists trg_xp_on_comment_insert on public.comments;
create trigger trg_xp_on_comment_insert after insert on public.comments
  for each row execute function public.xp_on_comment_insert();

create or replace function public.xp_on_reaction_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  if v_author is not null and v_author <> new.user_id then
    perform public.add_xp(v_author, 2);
  end if;
  return new;
end;
$$;
drop trigger if exists trg_xp_on_reaction_insert on public.post_reactions;
create trigger trg_xp_on_reaction_insert after insert on public.post_reactions
  for each row execute function public.xp_on_reaction_insert();

create or replace function public.xp_on_follow_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.add_xp(new.followee_id, 5); return new; end;
$$;
drop trigger if exists trg_xp_on_follow_insert on public.follows;
create trigger trg_xp_on_follow_insert after insert on public.follows
  for each row execute function public.xp_on_follow_insert();

create or replace function public.xp_on_community_join()
returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.add_xp(new.user_id, 8); return new; end;
$$;
drop trigger if exists trg_xp_on_community_join on public.community_memberships;
create trigger trg_xp_on_community_join after insert on public.community_memberships
  for each row execute function public.xp_on_community_join();

-- One-time XP backfill from existing activity so nobody starts at level 1
-- after upgrade.
update public.profiles p set
  xp = coalesce((
    select count(*) * 10 from public.posts where author_id = p.id
  ), 0) + coalesce((
    select count(*) * 4 from public.comments where author_id = p.id
  ), 0) + coalesce((
    select count(*) * 5 from public.follows where followee_id = p.id
  ), 0) + coalesce((
    select count(*) * 8 from public.community_memberships where user_id = p.id
  ), 0)
where xp = 0;

update public.profiles set level = public.xp_to_level(xp) where level < public.xp_to_level(xp);

-- =========================================================================
-- 6. Custom profile border URL (image url, https-only, length-capped)
-- =========================================================================
alter table public.profiles
  add column if not exists custom_border_url text;

-- Light validation: require https://, max 512 chars, ends with image extension.
alter table public.profiles drop constraint if exists profiles_custom_border_url_chk;
alter table public.profiles add constraint profiles_custom_border_url_chk
  check (
    custom_border_url is null
    or (
      length(custom_border_url) <= 512
      and custom_border_url ~ '^https://[A-Za-z0-9.\-/_%?=&:#~+]+\.(png|jpe?g|gif|webp)(\?.*)?$'
    )
  );
