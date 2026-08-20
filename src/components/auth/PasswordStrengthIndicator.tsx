"use client";

/**
 * PasswordStrengthIndicator — redesigned (monochrome, professional)
 *
 * Scoring (real rules, not just length):
 *   +1  length ≥ 8
 *   +1  length ≥ 12
 *   +1  contains uppercase
 *   +1  contains number
 *   +1  contains symbol
 *
 * Tiers:
 *   0–1 → Weak
 *   2   → Fair
 *   3   → Good
 *   4–5 → Strong
 *
 * Visual language: monochrome only — opacity & weight of --color-primary.
 * Signature: a single continuous pill bar, filling left-to-right,
 * opacity ramping from 0.15 → 1 as strength grows.
 */

import { useMemo } from "react";

interface Req {
  label: string;
  met: boolean;
}

interface Strength {
  score: number;   // 0–5
  tier: 0 | 1 | 2 | 3 | 4; // maps to Weak/Fair/Good/Strong (4=Strong+)
  label: string;
  fillPct: number; // 0–100 for the pill bar
  opacity: number; // fill opacity of the pill bar
  reqs: Req[];
}

function computeStrength(pw: string): Strength {
  const reqs: Req[] = [
    { label: "8+ characters",  met: pw.length >= 8 },
    { label: "Uppercase",      met: /[A-Z]/.test(pw) },
    { label: "Number",         met: /[0-9]/.test(pw) },
    { label: "Symbol",         met: /[^A-Za-z0-9]/.test(pw) },
  ];

  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (pw.length === 0) {
    return { score: 0, tier: 0, label: "", fillPct: 0, opacity: 0, reqs };
  }

  const tier = score <= 1 ? 1
    : score === 2 ? 2
    : score === 3 ? 3
    : 4;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const fills  = [0, 25, 50, 75, 100];
  const opacities = [0, 0.25, 0.5, 0.75, 1];

  return {
    score,
    tier: tier as Strength["tier"],
    label: labels[tier],
    fillPct: fills[tier],
    opacity: opacities[tier],
    reqs,
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  /** Show the requirement checklist pills. Default: true */
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  confirmPassword,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => computeStrength(password), [password]);

  const showStrength = password.length > 0;
  const showMatch    = confirmPassword !== undefined && confirmPassword.length > 0;
  const matches      = password === confirmPassword;

  if (!showStrength && !showMatch) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>

      {/* ── Pill bar + label ── */}
      {showStrength && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* Track */}
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              background: "var(--color-surface-3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${strength.fillPct}%`,
                borderRadius: 9999,
                background: `rgba(var(--color-primary-rgb), ${strength.opacity})`,
                transition: "width 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease",
              }}
            />
          </div>

          {/* Label */}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: strength.tier <= 1
                ? "var(--color-text-3)"
                : strength.tier === 2
                ? "var(--color-text-2)"
                : "var(--color-text)",
              minWidth: 44,
              textAlign: "right",
              transition: "color 300ms ease",
              opacity: password.length === 0 ? 0 : 1,
            }}
          >
            {strength.label}
          </span>
        </div>
      )}

      {/* ── Requirements checklist ── */}
      {showStrength && showRequirements && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {strength.reqs.map((req) => (
            <span
              key={req.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 9999,
                border: `1px solid ${req.met ? "rgba(var(--color-primary-rgb), 0.25)" : "var(--color-surface-3)"}`,
                background: req.met ? "rgba(var(--color-primary-rgb), 0.06)" : "transparent",
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: req.met ? 600 : 400,
                color: req.met ? "var(--color-text)" : "var(--color-text-3)",
                transition: "all 200ms ease",
              }}
            >
              {/* Tick */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{
                  opacity: req.met ? 1 : 0,
                  transform: req.met ? "scale(1)" : "scale(0.5)",
                  transition: "opacity 200ms ease, transform 200ms ease",
                  flexShrink: 0,
                }}
              >
                <path
                  d="M2 5l2.5 2.5L8 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {req.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Match hint ── */}
      {showMatch && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: matches ? "var(--color-text)" : "var(--color-text-3)",
            transition: "color 200ms ease",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              opacity: matches ? 1 : 0.4,
              transition: "opacity 200ms ease",
            }}
          >
            {matches ? (
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
          {matches ? "Passwords match" : "Passwords do not match"}
        </div>
      )}
    </div>
  );
}
