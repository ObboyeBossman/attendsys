"use client";

import React from "react";
import {
  BookOpen,
  GraduationCap,
  Presentation,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import styles from "./OversightStats.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface OversightStatsProps {
  semesterLabel: string;
  activeStudents: number;
  activeLecturers: number;
  sessionsToday: number;
  pendingDisputes: number;
  onDisputesPress?: () => void;
}

/* ── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className={styles.cardTop}>
        <span className={`${styles.icon} ${danger ? styles.iconDanger : ""}`}>
          {icon}
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.sub}>{sub}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        className={`${styles.card} ${danger ? styles.cardDanger : ""} ${styles.cardTappable}`}
        onClick={onClick}
        aria-label={`${label}: ${value}. Tap to view details.`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`${styles.card} ${danger ? styles.cardDanger : ""}`}>
      {inner}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function OversightStats({
  semesterLabel,
  activeStudents,
  activeLecturers,
  sessionsToday,
  pendingDisputes,
  onDisputesPress,
}: OversightStatsProps) {
  const hasSemester = semesterLabel !== "None";
  const hasDisputes = pendingDisputes > 0;

  return (
    <div className={styles.grid}>
      <StatCard
        icon={<BookOpen size={18} strokeWidth={1.75} />}
        label="Active Semester"
        value={hasSemester ? semesterLabel.split("—")[0].trim() : "—"}
        sub={hasSemester ? semesterLabel : "No active semester set"}
      />
      <StatCard
        icon={<GraduationCap size={18} strokeWidth={1.75} />}
        label="Active Students"
        value={activeStudents.toLocaleString()}
        sub="Enrolled & active"
      />
      <StatCard
        icon={<Presentation size={18} strokeWidth={1.75} />}
        label="Active Lecturers"
        value={activeLecturers.toLocaleString()}
        sub="Assigned to courses"
      />
      <StatCard
        icon={<CalendarDays size={18} strokeWidth={1.75} />}
        label="Sessions Today"
        value={sessionsToday.toLocaleString()}
        sub={new Date().toLocaleDateString("en-GH", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })}
      />
      <StatCard
        icon={<AlertTriangle size={18} strokeWidth={1.75} />}
        label="Pending Disputes"
        value={pendingDisputes.toLocaleString()}
        sub={hasDisputes ? "Tap to review" : "All clear"}
        danger={hasDisputes}
        onClick={hasDisputes ? onDisputesPress : undefined}
      />
    </div>
  );
}
