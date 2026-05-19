-- v1.3.3 — part 2: triggers/RPCs/storage that depend on part 1's enum
-- values & columns.

set local search_path = public;

-- =========================================================================
-- Trigger: notify community subscribers on new post in that community
-- =========================================================================
create or replace function public.tg_notify_on_community_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_community_name text;
  v_author_name text;
begin
  if new.community_id is null then
    return new;
  end if;

  select name into v_community_name from public.communities where id = new.community_id;
  select coalesce(display_name, username) into v_author_name from public.profiles where id = new.author_id;

  insert into public.notifications (user_id, actor_id, type, title, body, post_id, community_id, created_at)
  select
    m.user_id,
    new.author_id,
    'community_post'::public.notification_type,
    coalesce(v_community_name, 'Community') || ' · new post',
    coalesce(v_author_name, 'Someone') || ' just posted in ' || coalesce(v_community_name, 'a community you follow.'),
    new.id,
    new.community_id,
    now()
  from public.community_memberships m
  where m.community_id = new.community_id
    and m.notify_on_post = true
    and m.user_id <> new.author_id
    and m.role <> 'banned'
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = m.user_id and b.blocked_id = new.author_id)
         or (b.blocker_id = new.author_id and b.blocked_id = m.user_id)
    );

  return new;
end;
$$;

drop trigger if exists trg_notify_on_community_post on public.posts;
create trigger trg_notify_on_community_post
  after insert on public.posts
  for each row execute function public.tg_notify_on_community_post();

-- =========================================================================
-- RPC: pin community post (creator OR moderator)
-- =========================================================================
create or replace function public.pin_community_post(p_community_id uuid, p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.community_role;
  v_post_community uuid;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  select role into v_role from public.community_memberships
   where community_id = p_community_id and user_id = v_uid;

  if v_role is null or v_role not in ('creator','moderator') then
    raise exception 'not authorized to pin in this community';
  end if;

  if p_post_id is not null then
    select community_id into v_post_community from public.posts where id = p_post_id;
    if v_post_community is null or v_post_community <> p_community_id then
      raise exception 'post does not belong to this community';
    end if;
  end if;

  update public.communities set pinned_post_id = p_post_id, updated_at = now()
   where id = p_community_id;
end;
$$;

revoke all on function public.pin_community_post(uuid, uuid) from public;
revoke all on function public.pin_community_post(uuid, uuid) from anon;
grant execute on function public.pin_community_post(uuid, uuid) to authenticated;

-- =========================================================================
-- RPC: update community (creator only)
-- =========================================================================
create or replace function public.update_community(
  p_community_id uuid,
  p_name text,
  p_description text,
  p_bio text,
  p_avatar_url text,
  p_banner_url text,
  p_card_border text,
  p_custom_border_url text,
  p_social_links jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_creator uuid;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  select creator_id into v_creator from public.communities where id = p_community_id;
  if v_creator is null then
    raise exception 'community not found';
  end if;
  if v_creator <> v_uid then
    raise exception 'only the community creator can edit this community';
  end if;

  if p_name is not null and (char_length(p_name) < 3 or char_length(p_name) > 80) then
    raise exception 'name must be 3-80 chars';
  end if;
  if p_description is not null and char_length(p_description) > 500 then
    raise exception 'description must be <= 500 chars';
  end if;
  if p_bio is not null and char_length(p_bio) > 500 then
    raise exception 'bio must be <= 500 chars';
  end if;
  if p_custom_border_url is not null and p_custom_border_url <> '' and
     not (p_custom_border_url ~* '^https://[A-Za-z0-9.\-/_%?=&:#~+]+\.(png|jpe?g|gif|webp)(\?.*)?$') then
    raise exception 'custom border url must be https and an image';
  end if;

  update public.communities set
    name = coalesce(p_name, name),
    description = coalesce(p_description, description),
    bio = coalesce(p_bio, bio),
    avatar_url = case when p_avatar_url is null then avatar_url
                      when p_avatar_url = '' then null
                      else p_avatar_url end,
    banner_url = case when p_banner_url is null then banner_url
                      when p_banner_url = '' then null
                      else p_banner_url end,
    card_border = coalesce(p_card_border, card_border),
    custom_border_url = case when p_custom_border_url is null then custom_border_url
                             when p_custom_border_url = '' then null
                             else p_custom_border_url end,
    social_links = coalesce(p_social_links, social_links),
    updated_at = now()
  where id = p_community_id;
end;
$$;

revoke all on function public.update_community(uuid, text, text, text, text, text, text, text, jsonb) from public;
revoke all on function public.update_community(uuid, text, text, text, text, text, text, text, jsonb) from anon;
grant execute on function public.update_community(uuid, text, text, text, text, text, text, text, jsonb) to authenticated;

-- =========================================================================
-- RPC: toggle community post notifications for self
-- =========================================================================
create or replace function public.set_community_notify(p_community_id uuid, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  update public.community_memberships
     set notify_on_post = p_enabled, updated_at = now()
   where community_id = p_community_id and user_id = v_uid;
end;
$$;

revoke all on function public.set_community_notify(uuid, boolean) from public;
revoke all on function public.set_community_notify(uuid, boolean) from anon;
grant execute on function public.set_community_notify(uuid, boolean) to authenticated;

-- =========================================================================
-- RPC: delete own comment
-- =========================================================================
create or replace function public.delete_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_author uuid;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  select author_id into v_author from public.comments where id = p_comment_id;
  if v_author is null then
    return;
  end if;
  if v_author <> v_uid then
    raise exception 'not authorized to delete this comment';
  end if;

  delete from public.comments where id = p_comment_id;
end;
$$;

revoke all on function public.delete_comment(uuid) from public;
revoke all on function public.delete_comment(uuid) from anon;
grant execute on function public.delete_comment(uuid) to authenticated;

-- =========================================================================
-- Storage buckets: border-images + community-avatars
-- Also: ensure existing buckets accept image/gif by widening allowed_mime_types
-- (null = unrestricted).
-- =========================================================================
insert into storage.buckets (id, name, public)
  values ('border-images', 'border-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('community-avatars', 'community-avatars', true)
  on conflict (id) do nothing;

-- Make sure GIF/webp uploads aren't blocked by per-bucket mime restrictions.
update storage.buckets
   set allowed_mime_types = null
 where id in ('avatars', 'banners', 'post-images', 'community-banners', 'community-avatars', 'border-images');

drop policy if exists "border_images_owner_rw" on storage.objects;
create policy "border_images_owner_rw"
  on storage.objects for all
  using (bucket_id = 'border-images' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'border-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "border_images_public_read" on storage.objects;
create policy "border_images_public_read"
  on storage.objects for select
  using (bucket_id = 'border-images');

drop policy if exists "community_avatars_creator_rw" on storage.objects;
create policy "community_avatars_creator_rw"
  on storage.objects for all
  using (bucket_id = 'community-avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'community-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "community_avatars_public_read" on storage.objects;
create policy "community_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'community-avatars');
