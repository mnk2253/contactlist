-- Run this in Supabase SQL Editor before using the Notices tab.
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Safe to run when the notices table already exists.
alter table public.notices add column if not exists image_url text;

alter table public.notices enable row level security;

-- Public visitors can read published notices.
create policy "Anyone can read published notices"
on public.notices
for select
using (is_published = true);

-- Public users can submit notices, but they remain unpublished until approved.
create policy "Anyone can submit notices"
on public.notices
for insert
to anon, authenticated
with check (is_published = false);

-- Authenticated admins can manage notices.
create policy "Authenticated users can manage notices"
on public.notices
for all
to authenticated
using (true)
with check (true);
