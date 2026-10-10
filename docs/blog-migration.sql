-- Run ONCE in the Supabase SQL editor before using the new blog features.
-- Safe to run again: every statement uses "if not exists".

-- comma separated tool slugs for the "Try it now" card at the end of a post
alter table posts add column if not exists related_tool text;

-- columns the admin form already writes to (no-ops if they exist)
alter table posts add column if not exists updated_at timestamptz;
alter table posts add column if not exists published boolean default true;
alter table posts add column if not exists category text;
