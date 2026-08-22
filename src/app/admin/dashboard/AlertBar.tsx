"use client";

import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";
import styles from "./AlertBar.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertBarProps {
  /** Sessions running ≥ 4 hours → Critical */
  longRunningCount: number;
  /** Semesters whose start_date passed but are still inactive → Warning */
  staleSemesterCount: number;
  /** Pending disputes above the info threshold → Info */
  pendingDisputeCount: number;
  /** Info threshold — disputes must exceed this to register as an alert */
  disputeThreshold?: number;
  /** Called when user taps the bar (only when alerts exist) */
  onOpen: () => void;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function deriveSeverity(
  longRunningCount: number,
  staleSemesterCount: number,
  pendingDisputeCount: number,
  disputeThreshold: number
): { severity: AlertSeverity | null; totalAlerts: number; criticalCount: number } {
  const criticalCount = longRunningCount;
  const warningCount = staleSemesterCount;
  const infoCount = pendingDisputeCount > disputeThreshold ? 1 : 0;

  const totalAlerts = criticalCount + warningCount + infoCount;
  if (totalAlerts === 0) return { severity: null, totalAlerts: 0, criticalCount: 0 };

  if (criticalCount > 0) return { severity: "critical", totalAlerts, criticalCount };
  if (warningCount > 0) return { severity: "warning", totalAlerts, criticalCount: 0 };
  return { severity: "info", totalAlerts, criticalCount: 0 };
}

/**
 * Maps critical alert count to an intensity level 1–3.
 * Drives the slate background scale via data-intensity on the bar element.
 *   1 → light critical  (1–2 sessions)
 *   2 → medium critical (3–5 sessions)
 *   3 → dark critical   (6+  sessions)
 */
function criticalIntensityLevel(criticalCount: number): 1 | 2 | 3 {
  if (criticalCount >= 6) return 3;
  if (criticalCount >= 3) return 2;
  return 1;
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function AlertBar({
  longRunningCount,
  staleSemesterCount,
  pendingDisputeCount,
  disputeThreshold = 5,
  onOpen,
}: AlertBarProps) {
  const { severity, totalAlerts, criticalCount } = deriveSeverity(
    longRunningCount,
    staleSemesterCount,
    pendingDisputeCount,
    disputeThreshold
  );

  const hasAlerts = severity !== null;

  /* ── No-alerts state ─── */
  if (!hasAlerts) {
    return (
      <div className={styles.bar} aria-label="System status: all clear" aria-live="polite">
        <div className={styles.inner}>
          <CheckCircle size={14} strokeWidth={1.75} className={styles.iconHealthy} aria-hidden="true" />
          <span className={styles.labelHealthy}>All systems healthy</span>
        </div>
      </div>
    );
  }

  /* ── Alerts present state ─── */
  const severityLabel =
    severity === "critical" ? "Critical" : severity === "warning" ? "Warning" : "Info";

  const SeverityIcon =
    severity === "critical"
      ? AlertCircle
      : severity === "warning"
      ? AlertTriangle
      : Info;

  const alertNoun = totalAlerts === 1 ? "alert" : "alerts";

  // Intensity level only applies to critical — drives slate saturation scale
  const intensityAttr =
    severity === "critical"
      ? String(criticalIntensityLevel(criticalCount))
      : undefined;

  return (
    <button
      type="button"
      className={`${styles.bar} ${styles.barClickable} ${styles[`bar--${severity}`]}`}
      data-intensity={intensityAttr}
      onClick={onOpen}
      aria-label={`${totalAlerts} system ${alertNoun} — ${severityLabel}. Tap to review.`}
      aria-live="polite"
    >
      <div className={styles.inner}>
        <SeverityIcon size={14} strokeWidth={2} className={styles.iconAlert} aria-hidden="true" />
        <span className={styles.labelAlert}>
          <span className={styles.labelCount}>{totalAlerts}</span>
          {" "}{alertNoun}
        </span>
        <span className={styles.severityChip}>{severityLabel}</span>
      </div>
      <ChevronRight size={14} strokeWidth={1.75} className={styles.chevron} aria-hidden="true" />
    </button>
  );
}
