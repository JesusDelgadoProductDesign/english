-- Adds UI language preference to an existing user_settings table.
-- Run this once in the Supabase SQL editor if your project was set up
-- before this column existed in supabase/schema.sql.

alter table public.user_settings
  add column if not exists language text not null default 'en' check (language in ('en', 'es'));
