"use client";

/**
 * PasswordStrengthIndicator
 *
 * Renders a 4-segment strength bar and an optional match hint.
 * Used on every change-password screen in the app so the rules
 * are identical across all portals (SFR-AUTH-05).
 *
 * Strength thresholds (length-based, matching admin profile):
 *   < 8  chars → Too short  (danger)
 *   8–11 chars → Good       (warning)
 *   ≥ 12 chars → Strong     (success)
 */

interface PasswordStrengthIndicatorProps {
  /** The new password being typed */
  password: string;
  /** The confirm-password value — when provided, a match hint is shown */
  confirmPassword?: string;
}

function getStrength(password: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  const len = password.length;
  if (len === 0) return { level: 0, label: "", color: "" };
  if (len < 8)   return { level: 1, label: "Too short", color: "var(--color-danger)" };
  if (len < 10)  return { level: 2, label: "Good",      color: "var(--color-warning)" };
  if (len < 12)  return { level: 3, label: "Good",      color: "#f59e0b" };
  return           { level: 4, label: "Strong",    color: "var(--color-success)" };
}

export function PasswordStrengthIndicator({
  password,
  confirmPassword,
}: PasswordStrengthIndicatorProps) {
  const { level, label, color } = getStrength(password);
  const showStrength = password.length > 0;
  const showMatch =
    confirmPassword !== undefined && confirmPassword.length > 0;
  const matches = password === confirmPassword;

  if (!showStrength && !showMatch) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
      {/* ── Strength bar ── */}
      {showStrength && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* 4 segments */}
          <div style={{ display: "flex", flex: 1, gap: 4 }}>
            {([1, 2, 3, 4] as const).map((seg) => (
              <div
                key={seg}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: seg <= level ? color : "var(--color-surface-3)",
                  transition: "background 300ms ease",
                }}
              />
            ))}
          </div>
          {/* Label */}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color,
              minWidth: 52,
              textAlign: "right",
              transition: "color 300ms ease",
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* ── Match hint ── */}
      {showMatch && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: matches ? "var(--color-success)" : "var(--color-danger)",
            margin: 0,
            transition: "color 200ms ease",
          }}
        >
          {matches ? "✓ Passwords match" : "✗ Passwords do not match"}
        </p>
      )}
    </div>
  );
}
