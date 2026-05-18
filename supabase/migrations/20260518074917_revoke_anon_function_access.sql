revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.is_community_moderator(uuid, uuid) from anon;
revoke execute on function public.is_community_creator(uuid, uuid) from anon;
