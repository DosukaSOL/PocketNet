create extension if not exists pgcrypto;

create type public.friend_request_status as enum ('pending', 'accepted', 'rejected');
create type public.community_role as enum ('creator', 'moderator', 'member', 'banned');
create type public.report_target_type as enum ('user', 'post', 'comment', 'community');
create type public.notification_type as enum (
  'friend_request',
  'friend_accept',
  'post_like',
  'post_comment',
  'community_join',
  'moderation'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_][a-z0-9_.-]{2,29}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  banner_url text,
  bio text check (char_length(coalesce(bio, '')) <= 280),
  region text,
  social_links jsonb not null default '{}'::jsonb,
  favorite_handheld text,
  favorite_frontend text,
  favorite_systems text[] not null default '{}',
  favorite_games text[] not null default '{}',
  setup_notes text check (char_length(coalesce(setup_notes, '')) <= 1000),
  current_game text check (char_length(coalesce(current_game, '')) <= 100),
  current_status text check (char_length(coalesce(current_status, '')) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.friend_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id),
  unique (from_user_id, to_user_id)
);

create trigger friend_requests_set_updated_at
before update on public.friend_requests
for each row execute function public.set_updated_at();

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a_id <> user_b_id),
  unique (user_a_id, user_b_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
  name text not null check (char_length(name) between 3 and 80),
  description text not null default '' check (char_length(description) <= 500),
  banner_url text,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  pinned_post_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger communities_set_updated_at
before update on public.communities
for each row execute function public.set_updated_at();

create table public.community_memberships (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.community_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create trigger community_memberships_set_updated_at
before update on public.community_memberships
for each row execute function public.set_updated_at();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.communities
add constraint communities_pinned_post_fk
foreign key (pinned_post_id) references public.posts(id) on delete set null;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like' check (reaction = 'like'),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type public.notification_type not null,
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 300),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 120),
  details text check (char_length(coalesce(details, '')) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles using gin (to_tsvector('simple', username || ' ' || display_name));
create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_community_idx on public.posts (community_id, created_at desc);
create index comments_post_idx on public.comments (post_id, created_at asc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index memberships_user_idx on public.community_memberships (user_id);
create index reports_target_idx on public.reports (target_type, target_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
begin
  desired_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_.-]', '', 'g'));

  if desired_username is null or char_length(desired_username) < 3 then
    desired_username := 'player_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, desired_username, desired_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_community_moderator(target_community_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_memberships membership
    where membership.community_id = target_community_id
      and membership.user_id = target_user_id
      and membership.role in ('creator', 'moderator')
  );
$$;

create or replace function public.is_community_creator(target_community_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_memberships membership
    where membership.community_id = target_community_id
      and membership.user_id = target_user_id
      and membership.role = 'creator'
  );
$$;

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.blocks enable row level security;
alter table public.communities enable row level security;
alter table public.community_memberships enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert with check (id = auth.uid());
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "friend requests visible to participants" on public.friend_requests
for select using (auth.uid() in (from_user_id, to_user_id));
create policy "users send friend requests" on public.friend_requests
for insert with check (
  from_user_id = auth.uid()
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = to_user_id)
       or (b.blocker_id = to_user_id and b.blocked_id = auth.uid())
  )
);
create policy "receivers update friend requests" on public.friend_requests
for update using (to_user_id = auth.uid()) with check (to_user_id = auth.uid());

create policy "friendships visible to participants" on public.friendships
for select using (auth.uid() in (user_a_id, user_b_id));
create policy "participants create friendships" on public.friendships
for insert with check (auth.uid() in (user_a_id, user_b_id));
create policy "participants delete friendships" on public.friendships
for delete using (auth.uid() in (user_a_id, user_b_id));

create policy "users see own blocks" on public.blocks
for select using (blocker_id = auth.uid() or blocked_id = auth.uid());
create policy "users create own blocks" on public.blocks
for insert with check (blocker_id = auth.uid());
create policy "users remove own blocks" on public.blocks
for delete using (blocker_id = auth.uid());

create policy "communities are public" on public.communities for select using (true);
create policy "users create communities" on public.communities
for insert with check (creator_id = auth.uid());
create policy "community moderators update communities" on public.communities
for update using (public.is_community_moderator(id, auth.uid()))
with check (public.is_community_moderator(id, auth.uid()));
create policy "creators delete communities" on public.communities
for delete using (creator_id = auth.uid());

create policy "memberships are public" on public.community_memberships for select using (true);
create policy "users join communities" on public.community_memberships
for insert with check (
  user_id = auth.uid()
  and (
    role = 'member'
    or (
      role = 'creator'
      and exists (
        select 1 from public.communities c
        where c.id = community_id and c.creator_id = auth.uid()
      )
    )
  )
);
create policy "creators manage memberships" on public.community_memberships
for update using (public.is_community_creator(community_id, auth.uid()))
with check (public.is_community_creator(community_id, auth.uid()));
create policy "users leave communities" on public.community_memberships
for delete using (
  user_id = auth.uid()
  or public.is_community_creator(community_id, auth.uid())
);

create policy "posts are public" on public.posts for select using (true);
create policy "users create own posts" on public.posts
for insert with check (
  author_id = auth.uid()
  and (
    community_id is null
    or exists (
      select 1 from public.community_memberships membership
      where membership.community_id = community_id
        and membership.user_id = auth.uid()
        and membership.role in ('creator', 'moderator', 'member')
    )
  )
);
create policy "authors update own posts" on public.posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors and community moderators delete posts" on public.posts
for delete using (
  author_id = auth.uid()
  or (community_id is not null and public.is_community_moderator(community_id, auth.uid()))
);

create policy "post images are public" on public.post_images for select using (true);
create policy "authors attach own post images" on public.post_images
for insert with check (
  author_id = auth.uid()
  and exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
);
create policy "authors delete own post images" on public.post_images for delete using (author_id = auth.uid());

create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (author_id = auth.uid());
create policy "authors update own comments" on public.comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors and community moderators delete comments" on public.comments
for delete using (
  author_id = auth.uid()
  or exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and p.community_id is not null
      and public.is_community_moderator(p.community_id, auth.uid())
  )
);

create policy "reactions are public" on public.post_reactions for select using (true);
create policy "users create own reactions" on public.post_reactions for insert with check (user_id = auth.uid());
create policy "users remove own reactions" on public.post_reactions for delete using (user_id = auth.uid());

create policy "users see own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "actors create notifications" on public.notifications for insert with check (actor_id = auth.uid());
create policy "users update own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users create own reports" on public.reports for insert with check (reporter_id = auth.uid());
create policy "users see own reports" on public.reports for select using (reporter_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('post-images', 'post-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('community-banners', 'community-banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "users read public images" on storage.objects for select using (
  bucket_id in ('avatars', 'banners', 'post-images', 'community-banners')
);

create policy "users upload own images" on storage.objects for insert with check (
  bucket_id in ('avatars', 'banners', 'post-images', 'community-banners')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users update own images" on storage.objects for update using (
  bucket_id in ('avatars', 'banners', 'post-images', 'community-banners')
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id in ('avatars', 'banners', 'post-images', 'community-banners')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users delete own images" on storage.objects for delete using (
  bucket_id in ('avatars', 'banners', 'post-images', 'community-banners')
  and auth.uid()::text = (storage.foldername(name))[1]
);
