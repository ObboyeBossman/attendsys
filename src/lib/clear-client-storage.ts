/**
 * clear-client-storage.ts — SFR-AUTH-08
 *
 * Wipes all client-side storage that AttendSys writes during a session.
 * Called immediately before the server-side /api/auth/signout redirect so
 * that the next person who opens the app on the same device sees a clean
 * login screen with no data from the previous user.
 *
 * Keys cleared:
 *   localStorage  — "device_token"            (CheckinFlow: device trust ID)
 *   sessionStorage — "as_login_attempts"       (login-rate-limit.ts: SFR-AUTH-06)
 *   sessionStorage — "attendsys:banners-dismissed" (NoticeBanner.tsx)
 *
 * Important: device_token is deliberately cleared here. Although it
 * identifies the physical device, it also encodes trust from the previous
 * user's session. Clearing it means the next user must re-establish device
 * trust rather than inheriting it — correct behaviour for shared devices
 * (labs, borrowed phones).
 *
 * Safe to call in environments where storage APIs are unavailable (SSR,
 * private browsing with storage blocked). All operations are wrapped in
 * try/catch and fail silently.
 */

const LOCAL_STORAGE_KEYS: string[] = [
  "device_token", // CheckinFlow — device trust token (SFR-STUDENT-*)
];

const SESSION_STORAGE_KEYS: string[] = [
  "as_login_attempts",         // login-rate-limit.ts — SFR-AUTH-06
  "attendsys:banners-dismissed", // NoticeBanner.tsx — dismissed banner state
];

/**
 * Clears all AttendSys-owned entries from localStorage and sessionStorage.
 * Must be called client-side only (browser environment).
 */
export function clearClientStorage(): void {
  if (typeof window === "undefined") return;

  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage blocked or unavailable — degrade gracefully
    }
  }

  for (const key of SESSION_STORAGE_KEYS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Storage blocked or unavailable — degrade gracefully
    }
  }
}
