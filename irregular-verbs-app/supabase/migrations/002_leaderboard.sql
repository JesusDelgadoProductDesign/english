-- Weekly leaderboard, shared across all users (signed-in or anonymous).
-- Run this once in the Supabase SQL editor.
--
-- IMPORTANT: this feature also requires enabling Anonymous Sign-ins:
-- Supabase Dashboard -> Authentication -> Sign In / Providers -> Anonymous Sign-Ins -> Enable.
-- Guests get a lightweight anonymous auth session (no email/password) purely so they
-- can hold one rate-limited slot on the leaderboard; it does NOT sign them into the
-- app's normal cloud-sync mode (see AuthContext's is_anonymous handling).

create table public.leaderboard_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  weekly_xp integer not null default 0,
  week_start date not null,
  updated_at timestamptz not null default now()
);

alter table public.leaderboard_entries enable row level security;

-- The whole point of a leaderboard is that everyone can see everyone else's
-- entry — this is the one table in this project that is intentionally public.
create policy "leaderboard is publicly readable" on public.leaderboard_entries
  for select using (true);

-- But you can still only ever write your own row.
create policy "users insert their own leaderboard entry" on public.leaderboard_entries
  for insert with check (auth.uid() = user_id);

create policy "users update their own leaderboard entry" on public.leaderboard_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index leaderboard_week_xp_idx on public.leaderboard_entries (week_start, weekly_xp desc);
