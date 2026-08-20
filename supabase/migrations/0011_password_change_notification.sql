-- ============================================================
-- 0011_password_change_notification.sql
-- SFR-AUTH-15: Notify user when password is changed by an admin
--
-- Adds password_reset_by_admin_at to user_profiles.
-- NULL  = no pending notification.
-- Non-null = admin reset the password at this timestamp;
--            the user will see a security notice on next login,
--            after which the column is cleared back to NULL.
-- ============================================================

alter table user_profiles
  add column if not exists password_reset_by_admin_at timestamptz;

comment on column user_profiles.password_reset_by_admin_at is
  'Set to now() when an admin resets this account''s password. Cleared after the user acknowledges the security notice on next login (SFR-AUTH-15).';
