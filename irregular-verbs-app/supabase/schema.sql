-- Verbly cloud schema. Run once in the Supabase SQL editor for a new project.
-- Every table is scoped to auth.uid() via Row Level Security — a user can only
-- ever read/write their own rows.

-- 1. Spaced-repetition state, one row per (user, verb, field).
create table public.srs_cards (
  user_id uuid references auth.users(id) on delete cascade not null,
  verb_id text not null,
  field text not null check (field in ('infinitive','pastSimple','pastParticiple','meaning')),
  interval_days integer not null default 0,
  ease_factor double precision not null default 2.5,
  repetitions integer not null default 0,
  confidence double precision not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  total_attempts integer not null default 0,
  total_correct integer not null default 0,
  primary key (user_id, verb_id, field)
);

alter table public.srs_cards enable row level security;

create policy "own srs cards" on public.srs_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Gamification state, one row per user.
create table public.gamification_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  current_streak_days integer not null default 0,
  longest_streak_days integer not null default 0,
  last_active_date date,
  unlocked_achievement_ids text[] not null default '{}'
);

alter table public.gamification_state enable row level security;

create policy "own gamification state" on public.gamification_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. User settings, one row per user.
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_mode text not null default 'auto-mix',
  selection_strategy text not null default 'adaptive',
  difficulty text not null default 'medium',
  feedback_mode text not null default 'progressive-hints',
  enabled_hints text[] not null default '{first-letter,letter-count,missing-vowels,missing-consonants,reveal-on-attempt}',
  audio_enabled boolean not null default true,
  daily_goal integer not null default 20
);

alter table public.user_settings enable row level security;

create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Daily activity aggregate, one row per (user, date) — powers the dashboard
-- heatmap and XP/accuracy sparklines.
create table public.daily_activity (
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_date date not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  xp_earned integer not null default 0,
  study_time_ms bigint not null default 0,
  primary key (user_id, activity_date)
);

alter table public.daily_activity enable row level security;

create policy "own daily activity" on public.daily_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Raw attempt log — powers weakest/strongest/most-reviewed analytics and
-- average response time.
create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  verb_id text not null,
  mode text not null,
  results jsonb not null,
  hints_used integer not null default 0,
  response_time_ms integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.attempts enable row level security;

create policy "own attempts" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index attempts_user_created_idx on public.attempts (user_id, created_at desc);
