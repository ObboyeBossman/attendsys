-- ============================================================
-- 0009_account_lock.sql
-- SFR-AUTH-07 — Temporary account lock after failed attempts
--
-- Adds two columns to user_profiles:
--   failed_login_count  — cumulative failed attempts since last success (or reset)
--   locked_until        — if non-null and in the future, the account is locked
--
-- Lock policy (enforced in /api/auth/record-failure):
--   Threshold : 10 consecutive failed attempts
--   Duration  : 30 minutes
--   Reset     : cleared automatically on successful login (set-session)
--   Admin     : super_admin can clear both columns via the admin UI
-- ============================================================

alter table user_profiles
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists locked_until       timestamptz;

-- Helper: returns true when the account is currently locked
-- Used for quick DB-side checks; app layer also checks this.
create or replace function is_account_locked(profile_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(
    (select locked_until > now()
       from user_profiles
      where id = profile_id
      limit 1),
    false
  );
$$;

comment on column user_profiles.failed_login_count is
  'Consecutive failed login attempts since last successful login or admin reset.';
comment on column user_profiles.locked_until is
  'Timestamp after which the account is automatically unlocked. NULL = not locked.';
