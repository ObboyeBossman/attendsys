"use client";

import React, { useMemo } from "react";
import { CalendarDays, Users, BookOpen } from "lucide-react";
import styles from "./DaySummaryBanner.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface LiveSession {
  check_in_count: number;
  group_size: number;
}

interface DaySummaryBannerProps {
  sessionsToday: number;
  liveSessions: LiveSession[];
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function DaySummaryBanner({ sessionsToday, liveSessions }: DaySummaryBannerProps) {
  const totalCheckIns = useMemo(
    () => liveSessions.reduce((sum, s) => sum + s.check_in_count, 0),
    [liveSessions]
  );
  const totalEnrolled = useMemo(
    () => liveSessions.reduce((sum, s) => sum + s.group_size, 0),
    [liveSessions]
  );

  // Saturation: fraction of enrolled students currently checked in across live sessions.
  // Clamp to [0, 1]. When no live sessions, fill is 0.
  const saturation = totalEnrolled > 0 ? Math.min(1, totalCheckIns / totalEnrolled) : 0;
  const saturationPct = Math.round(saturation * 100);

  const today = new Date().toLocaleDateString("en-GH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const hasLive = liveSessions.length > 0;

  return (
    <div className={styles.banner}>
      {/* Top row — greeting + date */}
      <div className={styles.topRow}>
        <span className={styles.greeting}>{getGreeting()}</span>
        <span className={styles.date}>{today}</span>
      </div>

      {/* Stat row */}
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <CalendarDays size={14} strokeWidth={1.75} className={styles.statIcon} />
          <span className={styles.statValue}>{sessionsToday}</span>
          <span className={styles.statLabel}>session{sessionsToday !== 1 ? "s" : ""} today</span>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.stat}>
          <BookOpen size={14} strokeWidth={1.75} className={styles.statIcon} />
          <span className={styles.statValue}>{liveSessions.length}</span>
          <span className={styles.statLabel}>live now</span>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.stat}>
          <Users size={14} strokeWidth={1.75} className={styles.statIcon} />
          <span className={styles.statValue}>{totalCheckIns}</span>
          <span className={styles.statLabel}>checked in</span>
        </div>
      </div>

      {/* Signature move — check-in saturation glyph */}
      {hasLive && (
        <div
          className={styles.glyphTrack}
          role="meter"
          aria-valuenow={saturationPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${saturationPct}% of enrolled students checked in across live sessions`}
        >
          <div
            className={styles.glyphFill}
            style={{ "--saturation": saturation } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
}
