create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.is_community_moderator(uuid, uuid) from public;
revoke execute on function public.is_community_creator(uuid, uuid) from public;

grant execute on function public.is_community_moderator(uuid, uuid) to authenticated;
grant execute on function public.is_community_creator(uuid, uuid) to authenticated;

create index if not exists blocks_blocked_id_idx on public.blocks (blocked_id);
create index if not exists comments_author_idx on public.comments (author_id, created_at desc);
create index if not exists communities_creator_idx on public.communities (creator_id);
create index if not exists communities_pinned_post_idx on public.communities (pinned_post_id);
create index if not exists friend_requests_to_user_idx on public.friend_requests (to_user_id, created_at desc);
create index if not exists friendships_user_b_idx on public.friendships (user_b_id);
create index if not exists notifications_actor_idx on public.notifications (actor_id, created_at desc);
create index if not exists post_images_post_idx on public.post_images (post_id);
create index if not exists post_images_author_idx on public.post_images (author_id);
create index if not exists post_reactions_user_idx on public.post_reactions (user_id, created_at desc);
create index if not exists reports_reporter_idx on public.reports (reporter_id, created_at desc);
