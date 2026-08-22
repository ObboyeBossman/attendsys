"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { AlertCircle, AlertTriangle, Info, ArrowRight, X } from "lucide-react";
import styles from "./AlertSheet.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export interface AlertSheetProps {
  open: boolean;
  onClose: () => void;
  /** Sessions running ≥ 4 hours */
  longRunningSessions: Array<{
    id: string;
    started_at: string;
    courses: { name: string; code: string } | null;
  }>;
  /** Semesters whose start_date passed but are still inactive */
  staleSemesters: Array<{
    id: string;
    name: string;
    start_date: string;
  }>;
  /** Total pending disputes count */
  pendingDisputeCount: number;
  /** Disputes must exceed this to register as an alert (default: 5) */
  disputeThreshold?: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatElapsed(isoString: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function buildAlerts(
  longRunningSessions: AlertSheetProps["longRunningSessions"],
  staleSemesters: AlertSheetProps["staleSemesters"],
  pendingDisputeCount: number,
  disputeThreshold: number
): AlertItem[] {
  const alerts: AlertItem[] = [];

  // Critical — long-running sessions (one alert per session)
  for (const session of longRunningSessions) {
    const courseName = session.courses?.name ?? "Unknown course";
    const courseCode = session.courses?.code ? ` (${session.courses.code})` : "";
    alerts.push({
      id: `long-session-${session.id}`,
      severity: "critical",
      title: "Session still open",
      description: `${courseName}${courseCode} has been running for ${formatElapsed(session.started_at)} with no close signal. Close it or verify it is still in progress.`,
      actionLabel: "Review in monitor",
      actionHref: "/admin/monitor",
    });
  }

  // Warning — stale semesters (one alert per semester)
  for (const sem of staleSemesters) {
    const startDate = new Date(sem.start_date).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    alerts.push({
      id: `stale-semester-${sem.id}`,
      severity: "warning",
      title: "Semester not opened",
      description: `${sem.name} was scheduled to start on ${startDate} but is still marked inactive. Open it to allow sessions and check-ins to proceed.`,
      actionLabel: "Open semester",
      actionHref: "/admin/semesters",
    });
  }

  // Info — pending disputes above threshold
  if (pendingDisputeCount > disputeThreshold) {
    alerts.push({
      id: "pending-disputes",
      severity: "info",
      title: "Disputes need attention",
      description: `${pendingDisputeCount} attendance disputes are pending review. Students are waiting for a resolution — review the oldest ones first.`,
      actionLabel: "View disputes",
      actionHref: "/admin/feedback",
    });
  }

  return alerts;
}

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

const SeverityIcon = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const severityLabel = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
} as const;

/* ── Component ──────────────────────────────────────────────────────────── */

export function AlertSheet({
  open,
  onClose,
  longRunningSessions,
  staleSemesters,
  pendingDisputeCount,
  disputeThreshold = 5,
}: AlertSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  const alerts = buildAlerts(
    longRunningSessions,
    staleSemesters,
    pendingDisputeCount,
    disputeThreshold
  ).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard: close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Touch: swipe-down to close
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta < 0) return; // no upward overscroll
    dragCurrentY.current = delta;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "";
      sheetRef.current.style.transform = "";
    }
    if (dragCurrentY.current > 80) {
      onClose();
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [onClose]);

  const handleActionClick = useCallback(
    (href: string) => {
      onClose();
      // Navigate — use window.location for full navigation to keep things simple
      // (avoids importing useRouter in a non-page component)
      window.location.href = href;
    },
    [onClose]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="System alerts"
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className={styles.handle} aria-hidden="true" />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitle}>System Alerts</span>
            {alerts.length > 0 && (
              <span className={styles.headerCount}>{alerts.length}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close alerts"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Alert list */}
        <div className={styles.list}>
          {alerts.map((alert) => {
            const Icon = SeverityIcon[alert.severity];
            return (
              <div
                key={alert.id}
                className={`${styles.alertRow} ${styles[`alertRow--${alert.severity}`]}`}
                data-severity={alert.severity}
              >
                {/* Severity accent line — the signature move */}
                <span className={styles.accentLine} aria-hidden="true" />

                <div className={styles.alertContent}>
                  <div className={styles.alertTop}>
                    <Icon
                      size={14}
                      strokeWidth={1.75}
                      className={styles.alertIcon}
                      aria-hidden="true"
                    />
                    <span className={styles.alertSeverityChip}>
                      {severityLabel[alert.severity]}
                    </span>
                    <span className={styles.alertTitle}>{alert.title}</span>
                  </div>
                  <p className={styles.alertDescription}>{alert.description}</p>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleActionClick(alert.actionHref)}
                  >
                    {alert.actionLabel}
                    <ArrowRight size={13} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
