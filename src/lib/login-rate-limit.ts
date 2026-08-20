/**
 * login-rate-limit.ts — SFR-AUTH-06
 *
 * Client-side progressive rate limiting for login failures.
 * Tracks failed attempts per email in sessionStorage and enforces
 * a cooldown period before the next attempt is allowed.
 *
 * Progressive cooldown table:
 *   1–2 failures → no delay (genuine mistype forgiveness)
 *   3   failures → 15s cooldown
 *   4   failures → 30s cooldown
 *   5+  failures → 60s cooldown
 *
 * State is scoped to the browser session (clears on tab close).
 * A successful login resets the counter for that email.
 */

const STORAGE_KEY = "as_login_attempts";

interface AttemptRecord {
  count: number;
  lastFailedAt: number; // unix ms
  cooldownUntil: number; // unix ms — 0 if no cooldown active
}

type AttemptStore = Record<string, AttemptRecord>;

function readStore(): AttemptStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: AttemptStore): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage unavailable — degrade gracefully
  }
}

function cooldownSeconds(count: number): number {
  if (count <= 2) return 0;
  if (count === 3) return 15;
  if (count === 4) return 30;
  return 60;
}

/**
 * Returns how many seconds remain in the cooldown (0 if none).
 */
export function getRemainingCooldown(email: string): number {
  const key = email.trim().toLowerCase();
  const store = readStore();
  const record = store[key];
  if (!record) return 0;
  const remaining = Math.ceil((record.cooldownUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Call after a failed login attempt. Returns the new cooldown in seconds (0 = none).
 */
export function recordFailedAttempt(email: string): number {
  const key = email.trim().toLowerCase();
  const store = readStore();
  const existing = store[key] ?? { count: 0, lastFailedAt: 0, cooldownUntil: 0 };

  const newCount = existing.count + 1;
  const secs = cooldownSeconds(newCount);
  const now = Date.now();

  store[key] = {
    count: newCount,
    lastFailedAt: now,
    cooldownUntil: secs > 0 ? now + secs * 1000 : 0,
  };

  writeStore(store);
  return secs;
}

/**
 * Call after a successful login. Clears the counter for this email.
 */
export function clearAttempts(email: string): void {
  const key = email.trim().toLowerCase();
  const store = readStore();
  delete store[key];
  writeStore(store);
}

/**
 * Returns the current failed attempt count for an email.
 */
export function getAttemptCount(email: string): number {
  const key = email.trim().toLowerCase();
  const store = readStore();
  return store[key]?.count ?? 0;
}
