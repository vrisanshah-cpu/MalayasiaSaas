-- AdCheck MY database schema.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- against a fresh project. Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
--
-- Model: a "business account" (accounts) can have multiple team members
-- (account_members, owner|member roles) and owns a history of compliance
-- checks (checks). Billing tier lives on the account, not the individual
-- user, since a subscription covers the whole team (Phase 3/4).
--
-- Tables are all created first, then RLS policies (which reference each
-- other across tables) are added afterward - policies can't reference a
-- table that doesn't exist yet.

-- ── accounts ────────────────────────────────────────────────────────────
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now()
);

-- ── account_members ────────────────────────────────────────────────────
create table if not exists public.account_members (
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

-- ── checks ──────────────────────────────────────────────────────────────
create table if not exists public.checks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete set null,
  category text not null,
  locale text not null default 'en',
  ad_copy text not null,
  score int not null,
  flagged_phrases jsonb not null default '[]'::jsonb,
  safe_rewrite_suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists checks_account_id_created_at_idx
  on public.checks (account_id, created_at desc);

-- ── row level security ──────────────────────────────────────────────────
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.checks enable row level security;

-- A policy on account_members can't subquery account_members directly -
-- Postgres re-applies the same policy to that subquery, recursing forever
-- ("infinite recursion detected in policy for relation account_members").
-- This SECURITY DEFINER function does the membership lookup with RLS
-- bypassed (definer's privileges, not the caller's), so policies can call
-- it safely instead of subquerying the table directly.
create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.account_members
    where account_id = target_account_id and user_id = auth.uid()
  );
$$;

drop policy if exists "members can view their account" on public.accounts;
create policy "members can view their account" on public.accounts
  for select using (public.is_account_member(id));
-- Updates to tier/stripe_* fields happen only via the billing webhook route,
-- which uses the service role key and therefore bypasses RLS entirely -
-- intentionally no client-facing update policy here.

drop policy if exists "members can view their account roster" on public.account_members;
create policy "members can view their account roster" on public.account_members
  for select using (public.is_account_member(account_id));
-- Invites (inserts) happen via /api/team/invite using the service role key,
-- not directly from the client - no client-facing insert policy here.

drop policy if exists "members can view their account's checks" on public.checks;
create policy "members can view their account's checks" on public.checks
  for select using (public.is_account_member(account_id));

-- Inserts happen server-side (API route) using the signed-in user's session
-- via the anon key + RLS, scoped to an account the user actually belongs to.
drop policy if exists "members can insert checks for their account" on public.checks;
create policy "members can insert checks for their account" on public.checks
  for insert with check (
    public.is_account_member(account_id) and user_id = auth.uid()
  );

-- ── new user -> personal account bootstrap ─────────────────────────────
-- On first sign-in, auto-create a personal account with the new user as
-- owner - UNLESS they were invited to an existing account (see
-- /api/team/invite, which stamps invited_account_id into user_metadata),
-- in which case they join that account as a member instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invited_account_id uuid;
  new_account_id uuid;
begin
  invited_account_id := (new.raw_user_meta_data ->> 'invited_account_id')::uuid;

  if invited_account_id is not null then
    insert into public.account_members (account_id, user_id, email, role)
    values (invited_account_id, new.id, new.email, 'member');
  else
    insert into public.accounts (name) values (coalesce(new.email, 'My account'))
      returning id into new_account_id;
    insert into public.account_members (account_id, user_id, email, role)
      values (new_account_id, new.id, new.email, 'owner');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
