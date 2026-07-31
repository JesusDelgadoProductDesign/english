-- Adds support for grammar-topic practice (beyond irregular verbs).
-- Run this once in the Supabase SQL editor.

-- Grammar attempts have no verb, so verb_id must become nullable; topic_id and
-- pattern_id are set instead for those rows.
alter table public.attempts alter column verb_id drop not null;
alter table public.attempts add column if not exists topic_id text;
alter table public.attempts add column if not exists pattern_id text;

-- Simple per-(topic, pattern) accuracy aggregate — no spaced-repetition
-- scheduling for grammar topics, unlike srs_cards for verbs (item banks are
-- much smaller, so per-item SRS isn't warranted).
create table public.grammar_pattern_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  pattern_id text not null,
  total_attempts integer not null default 0,
  total_correct integer not null default 0,
  last_attempted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id, pattern_id)
);

alter table public.grammar_pattern_stats enable row level security;

create policy "own grammar pattern stats" on public.grammar_pattern_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
