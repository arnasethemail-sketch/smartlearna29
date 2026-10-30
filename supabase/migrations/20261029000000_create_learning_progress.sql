create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{"schemaVersion":1,"updatedAt":"1970-01-01T00:00:00.000Z","storyAdventureState":{"schemaVersion":1,"region":"US","textScale":"standard","progressByLesson":{}},"bestTimesSeconds":{"addition":null,"subtraction":null,"fractions":null},"activeAttempts":{},"completedAttempts":[]}'::jsonb,
  revision bigint not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.learning_progress enable row level security;

revoke all on table public.learning_progress from anon;
grant select, insert, update, delete on table public.learning_progress to authenticated;

drop policy if exists "Users can read their learning progress" on public.learning_progress;
create policy "Users can read their learning progress"
on public.learning_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their learning progress" on public.learning_progress;
create policy "Users can insert their learning progress"
on public.learning_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their learning progress" on public.learning_progress;
create policy "Users can update their learning progress"
on public.learning_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their learning progress" on public.learning_progress;
create policy "Users can delete their learning progress"
on public.learning_progress for delete
to authenticated
using ((select auth.uid()) = user_id);
