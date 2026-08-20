-- ============================================================
-- 0010_support_requests.sql
-- SFR-AUTH-14: Account recovery / contact-admin submissions
-- Submitted from the login screen — no auth required.
-- Admins review via the existing Feedback Inbox portal.
-- ============================================================

create table if not exists support_requests (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  role          text not null check (role in ('student', 'lecturer')),
  subject       text not null,
  message       text not null,
  is_read_admin boolean not null default false,
  created_at    timestamptz not null default now()
);

-- index for admin view (unread first, newest first)
create index if not exists support_requests_admin_idx
  on support_requests (is_read_admin, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────
-- Public insert (no auth) — rate-limiting is enforced at app level.
-- Only service role (admin client) can read.
alter table support_requests enable row level security;

do $$ begin
  create policy "support_requests_insert_public"
    on support_requests for insert
    with check (true);
exception when duplicate_object then null; end $$;
-- Reads are handled exclusively via the service-role admin client (no select policy needed).
