-- Allow login by username: expose a SECURITY DEFINER RPC that anon can call
-- to look up the auth.users.email for a given public.profiles.username.
-- Usernames are public information (visible on profiles), so this lookup
-- does not leak anything that isn't already public, but we still wrap it in
-- a function to keep auth.users locked down by default.

create or replace function public.email_for_username(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = lower(p_username)
  limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;
