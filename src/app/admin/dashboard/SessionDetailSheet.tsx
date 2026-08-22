"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { X, Clock, MapPin, User, Users, BookOpen, CheckCircle } from "lucide-react";
import styles from "./SessionDetailSheet.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface SessionDetail {
  id: string;
  started_at: string;
  venue: string | null;
  check_in_count: number;
  group_size: number;
  opened_by_name: string | null;
  opened_by_role: "lecturer" | "rep" | null;
  courses: {
    name: string;
    code: string;
    groups: { group_name: string } | null;
  } | null;
}

interface SessionDetailSheetProps {
  session: SessionDetail | null;
  onClose: () => void;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatElapsed(isoString: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatStartTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Check-in arc ───────────────────────────────────────────────────────── */

function CheckInArc({ ratio }: { ratio: number }) {
  const r = 28;
  const cx = 36;
  const cy = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, ratio)));

  return (
    <svg
      width={72}
      height={72}
      viewBox="0 0 72 72"
      aria-hidden="true"
      className={styles.arc}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-surface-3)"
        strokeWidth={5}
      />
      {/* Fill */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-text-primary)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 500ms var(--ease-out)" }}
      />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function SessionDetailSheet({ session, onClose }: SessionDetailSheetProps) {
  const open = session !== null;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Swipe-down to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragOffset(dy);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
    setIsDragging(false);
    dragStartY.current = null;
  }, [dragOffset, onClose]);

  // Trap focus & escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!session) return null;

  const ratio = session.group_size > 0 ? session.check_in_count / session.group_size : 0;
  const pct = Math.round(ratio * 100);
  const courseName = session.courses?.name ?? "Course Session";
  const courseCode = session.courses?.code;
  const groupName = session.courses?.groups?.group_name ?? "All Groups";

  const openedByLabel = session.opened_by_name
    ? `${session.opened_by_name}${session.opened_by_role ? ` · ${session.opened_by_role === "rep" ? "Rep" : "Lecturer"}` : ""}`
    : session.opened_by_role === "rep"
    ? "Class rep"
    : "Lecturer";

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={`Session detail — ${courseName}`}
    >
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        style={{
          transform: `translateY(${isDragging ? dragOffset : 0}px)`,
          transition: isDragging ? "none" : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className={styles.handle} aria-hidden="true" />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.headerLabel}>Live Session</p>
            <h2 className={styles.headerTitle}>{courseName}</h2>
            {courseCode && (
              <span className={styles.headerCode}>{courseCode}</span>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close session detail"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Arc + ratio */}
        <div className={styles.arcSection}>
          <div className={styles.arcWrap}>
            <CheckInArc ratio={ratio} />
            <div className={styles.arcCenter}>
              <span className={styles.arcPct}>{pct}</span>
              <span className={styles.arcPctSymbol}>%</span>
            </div>
          </div>
          <div className={styles.arcMeta}>
            <p className={styles.arcLabel}>Check-in rate</p>
            <p className={styles.arcSub}>
              <span className={styles.arcChecked}>{session.check_in_count}</span>
              {" of "}
              <span>{session.group_size}</span>
              {" students"}
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <div className={styles.detailList}>
          <div className={styles.detailRow}>
            <BookOpen size={16} strokeWidth={1.75} className={styles.detailIcon} />
            <div>
              <p className={styles.detailLabel}>Group</p>
              <p className={styles.detailValue}>{groupName}</p>
            </div>
          </div>

          <div className={styles.detailRow}>
            <Clock size={16} strokeWidth={1.75} className={styles.detailIcon} />
            <div>
              <p className={styles.detailLabel}>Running time</p>
              <p className={styles.detailValue}>
                {formatElapsed(session.started_at)}
                <span className={styles.detailMeta}> · started {formatStartTime(session.started_at)}</span>
              </p>
            </div>
          </div>

          {session.venue && (
            <div className={styles.detailRow}>
              <MapPin size={16} strokeWidth={1.75} className={styles.detailIcon} />
              <div>
                <p className={styles.detailLabel}>Venue</p>
                <p className={styles.detailValue}>{session.venue}</p>
              </div>
            </div>
          )}

          <div className={styles.detailRow}>
            <User size={16} strokeWidth={1.75} className={styles.detailIcon} />
            <div>
              <p className={styles.detailLabel}>Opened by</p>
              <p className={styles.detailValue}>{openedByLabel}</p>
            </div>
          </div>

          <div className={styles.detailRow}>
            <Users size={16} strokeWidth={1.75} className={styles.detailIcon} />
            <div>
              <p className={styles.detailLabel}>Attendance</p>
              <p className={styles.detailValue}>
                <CheckCircle
                  size={14}
                  strokeWidth={1.75}
                  style={{ color: "var(--color-success)", display: "inline", verticalAlign: "middle", marginRight: 4 }}
                />
                {session.check_in_count} checked in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
