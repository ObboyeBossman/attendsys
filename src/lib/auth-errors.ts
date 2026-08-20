/**
 * Centralized authentication error message formatter for SFR-AUTH-04
 * Maps raw technical errors, Supabase Auth errors, and API exceptions into
 * clear, actionable, user-centric human-readable error messages.
 */

export function formatAuthErrorMessage(
  err: any,
  fallbackMsg = "Authentication failed. Please check your credentials and try again."
): string {
  if (!err) return fallbackMsg;

  let raw = "";
  if (typeof err === "string") {
    raw = err;
  } else if (err && typeof err === "object") {
    raw = err.message || err.error_description || err.msg || err.error || "";
  }

  raw = raw.trim();
  if (!raw || raw === "{}" || raw === "[object Object]") {
    return fallbackMsg;
  }

  const lower = raw.toLowerCase();

  // Invalid credentials / user not found
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_grant") ||
    lower.includes("invalid_credentials") ||
    lower.includes("user not found")
  ) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  // Email verification required
  if (lower.includes("email not confirmed") || lower.includes("unconfirmed email")) {
    return "Your email address has not been verified. Please check your inbox for the verification link.";
  }

  // Rate limiting / lockouts
  if (
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("exceeded")
  ) {
    return "Too many login attempts. Please wait a few minutes before trying again.";
  }

  // Network / server connection failures
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network") ||
    lower.includes("connection refused")
  ) {
    return "Network connection error. Please check your internet connection and try again.";
  }

  // Deactivated account
  if (lower.includes("deactivated") || lower.includes("inactive account")) {
    return "Your account has been deactivated. Please contact your department administrator.";
  }

  // Password reset errors
  if (lower.includes("same password") || lower.includes("different from your current")) {
    return "New password must be different from your current password.";
  }

  // Return cleaned string with capitalized first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
