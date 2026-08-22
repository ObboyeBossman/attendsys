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
): { severity: AlertSeverity | null; totalAlerts: number } {
  const criticalCount = longRunningCount;
  const warningCount = staleSemesterCount;
  const infoCount = pendingDisputeCount > disputeThreshold ? 1 : 0;

  const totalAlerts = criticalCount + warningCount + infoCount;
  if (totalAlerts === 0) return { severity: null, totalAlerts: 0 };

  if (criticalCount > 0) return { severity: "critical", totalAlerts };
  if (warningCount > 0) return { severity: "warning", totalAlerts };
  return { severity: "info", totalAlerts };
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function AlertBar({
  longRunningCount,
  staleSemesterCount,
  pendingDisputeCount,
  disputeThreshold = 5,
  onOpen,
}: AlertBarProps) {
  const { severity, totalAlerts } = deriveSeverity(
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

  return (
    <button
      type="button"
      className={`${styles.bar} ${styles.barClickable} ${styles[`bar--${severity}`]}`}
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
