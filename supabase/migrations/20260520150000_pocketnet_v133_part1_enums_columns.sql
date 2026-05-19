-- v1.3.3 — communities: avatar/bio/social_links/borders; per-community post
-- notifications; pin/update RPCs; border-images bucket.
--
-- Also: backfill the v1.3.2 migration which silently failed to add new
-- notification columns / enum values because notifications.type is an enum,
-- not a text + CHECK column.

set local search_path = public;

-- =========================================================================
-- 0. Backfill v1.3.2 notification enum + columns
-- =========================================================================
alter type public.notification_type add value if not exists 'follow';
alter type public.notification_type add value if not exists 'comment_reply';
alter type public.notification_type add value if not exists 'mention';
alter type public.notification_type add value if not exists 'achievement';
alter type public.notification_type add value if not exists 'level_up';
alter type public.notification_type add value if not exists 'community_post';

alter table public.notifications
  add column if not exists post_id uuid references public.posts(id) on delete cascade,
  add column if not exists comment_id uuid references public.comments(id) on delete cascade,
  add column if not exists community_id uuid references public.communities(id) on delete cascade;

-- =========================================================================
-- 1. Communities: identity + border fields
-- =========================================================================
alter table public.communities
  add column if not exists avatar_url text,
  add column if not exists bio text default '',
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists card_border text not null default 'classic',
  add column if not exists custom_border_url text;

alter table public.communities
  drop constraint if exists communities_bio_chk;
alter table public.communities
  add constraint communities_bio_chk
  check (char_length(coalesce(bio, '')) <= 500);

alter table public.communities
  drop constraint if exists communities_custom_border_url_chk;
alter table public.communities
  add constraint communities_custom_border_url_chk
  check (
    custom_border_url is null
    or (
      char_length(custom_border_url) <= 512
      and custom_border_url ~* '^https://[A-Za-z0-9.\-/_%?=&:#~+]+\.(png|jpe?g|gif|webp)(\?.*)?$'
    )
  );

alter table public.community_memberships
  add column if not exists notify_on_post boolean not null default false;
