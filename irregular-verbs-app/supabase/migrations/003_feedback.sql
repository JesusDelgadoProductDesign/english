-- User feedback submissions. Run this once in the Supabase SQL editor.
--
-- Deliberately insert-only from the client: anyone can submit (signed in,
-- anonymous, or with no session at all), but there is no select policy, so
-- nobody can read feedback back through the app — only via the Supabase
-- dashboard's Table Editor (or a service-role key), which is the closest
-- thing this app has to an "admin view" for now.
create table public.feedback_submissions (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('verb-error', 'bug', 'feature-request', 'ux', 'translation', 'other')),
  message text not null check (char_length(message) between 1 and 2000),
  contact_email text,
  page text,
  language text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.feedback_submissions enable row level security;

create policy "anyone can submit feedback" on public.feedback_submissions
  for insert with check (true);
