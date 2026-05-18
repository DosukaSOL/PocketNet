-- v1.0 — Direct messages + lightweight presence
-- Adds:
--   * profiles.last_seen_at — heartbeat written by the client every minute so
--     friends can show an "online" dot. No realtime presence channel needed.
--   * dm_threads — one row per pair of users. participant_a_id is always the
--     lexicographically smaller UUID so the (a, b) pair is canonical and
--     `unique`-able.
--   * dm_messages — private messages. RLS restricts both SELECT and INSERT to
--     the two participants of the parent thread. Nobody else, including
--     anonymous clients, can read or write.
--   * find_or_create_dm_thread(other_user_id) — SECURITY DEFINER helper so
--     clients can open a conversation atomically without race conditions.

alter table public.profiles
  add column if not exists last_seen_at timestamptz not null default now();

create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set last_seen_at = now()
  where id = auth.uid();
$$;

revoke all on function public.touch_last_seen() from public, anon;
grant execute on function public.touch_last_seen() to authenticated;

create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  participant_a_id uuid not null references public.profiles(id) on delete cascade,
  participant_b_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  check (participant_a_id <> participant_b_id),
  check (participant_a_id < participant_b_id),
  unique (participant_a_id, participant_b_id)
);

create index if not exists dm_threads_participants_idx
  on public.dm_threads (participant_a_id, participant_b_id);
create index if not exists dm_threads_recent_idx
  on public.dm_threads (last_message_at desc nulls last);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists dm_messages_thread_created_idx
  on public.dm_messages (thread_id, created_at asc);

alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;

drop policy if exists "dm thread participants select" on public.dm_threads;
create policy "dm thread participants select" on public.dm_threads
for select using (auth.uid() in (participant_a_id, participant_b_id));

-- INSERT must go through find_or_create_dm_thread() to enforce canonical
-- ordering. Block direct INSERT from clients.
drop policy if exists "dm threads insert blocked" on public.dm_threads;
create policy "dm threads insert blocked" on public.dm_threads
for insert with check (false);

drop policy if exists "dm threads no update" on public.dm_threads;
create policy "dm threads no update" on public.dm_threads
for update using (false) with check (false);

drop policy if exists "dm messages visible to participants" on public.dm_messages;
create policy "dm messages visible to participants" on public.dm_messages
for select using (
  exists (
    select 1 from public.dm_threads t
    where t.id = thread_id
      and auth.uid() in (t.participant_a_id, t.participant_b_id)
  )
);

drop policy if exists "dm messages senders insert" on public.dm_messages;
create policy "dm messages senders insert" on public.dm_messages
for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.dm_threads t
    where t.id = thread_id
      and auth.uid() in (t.participant_a_id, t.participant_b_id)
  )
);

-- Receivers can mark their own messages read.
drop policy if exists "dm messages receivers update read" on public.dm_messages;
create policy "dm messages receivers update read" on public.dm_messages
for update using (
  sender_id <> auth.uid()
  and exists (
    select 1 from public.dm_threads t
    where t.id = thread_id
      and auth.uid() in (t.participant_a_id, t.participant_b_id)
  )
) with check (
  sender_id <> auth.uid()
  and exists (
    select 1 from public.dm_threads t
    where t.id = thread_id
      and auth.uid() in (t.participant_a_id, t.participant_b_id)
  )
);

create or replace function public.find_or_create_dm_thread(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  a uuid;
  b uuid;
  existing_id uuid;
  new_id uuid;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  if other_user_id is null or other_user_id = me then
    raise exception 'Invalid recipient';
  end if;

  if exists (
    select 1 from public.blocks
    where (blocker_id = me and blocked_id = other_user_id)
       or (blocker_id = other_user_id and blocked_id = me)
  ) then
    raise exception 'You cannot message this user';
  end if;

  if me < other_user_id then
    a := me; b := other_user_id;
  else
    a := other_user_id; b := me;
  end if;

  select id into existing_id from public.dm_threads
  where participant_a_id = a and participant_b_id = b;

  if existing_id is not null then
    return existing_id;
  end if;

  insert into public.dm_threads (participant_a_id, participant_b_id)
  values (a, b)
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.find_or_create_dm_thread(uuid) from public, anon;
grant execute on function public.find_or_create_dm_thread(uuid) to authenticated;

-- Bump last_message_at when a new message lands so thread lists can sort.
create or replace function public.dm_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_threads
  set last_message_at = new.created_at
  where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists dm_messages_bump_thread on public.dm_messages;
create trigger dm_messages_bump_thread
after insert on public.dm_messages
for each row execute function public.dm_messages_after_insert();
