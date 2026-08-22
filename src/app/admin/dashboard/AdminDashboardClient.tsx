"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity, History, Clock } from "lucide-react";
import { OversightStats } from "./OversightStats";
import { DaySummaryBanner } from "./DaySummaryBanner";
import { SessionDetailSheet, type SessionDetail } from "./SessionDetailSheet";
import { AlertSheet } from "./AlertSheet";
import { usePageSwipe } from "@/hooks/usePageSwipe";
import { setDashboardAlertStore } from "@/components/layout/PortalLayout";
import styles from "./dashboard.module.css";

/* ── Types ─────────────────────────────────────────────────────────────── */

type LiveSession = {
  id: string;
  started_at: string;
  venue: string | null;
  created_by: string | null;
  check_in_count: number;
  group_size: number;
  opened_by_name: string | null;
  opened_by_role: "lecturer" | "rep" | null;
  courses: {
    name: string;
    code: string;
    group_id: string;
    lecturer_id: string | null;
    groups: { group_name: string } | null;
  } | null;
};

type AuditEvent = {
  id: number;
  action: string;
  table_name: string | null;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
};

type StaleSemester = {
  id: string;
  name: string;
  start_date: string;
};

type LongRunningSession = {
  id: string;
  started_at: string;
  courses: { name: string; code: string } | null;
};

interface AdminDashboardClientProps {
  data: {
    semesterLabel: string;
    activeStudents: number;
    activeLecturers: number;
    sessionsToday: number;
    pendingDisputes: number;
    liveSessions: LiveSession[];
    auditEvents: AuditEvent[];
    longRunningSessions: LongRunningSession[];
    staleSemesters: StaleSemester[];
  };
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function elapsed(isoString: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const tabs = ["live", "oversight"] as const;
  type Tab = typeof tabs[number];

  const [activeTab, setActiveTab] = useState<Tab>("live");
  const activeIndex = tabs.indexOf(activeTab);

  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);

  // Listen for alert bar tap dispatched from PortalLayout's fixed AlertBar
  useEffect(() => {
    const onAlertOpen = () => setAlertSheetOpen(true);
    window.addEventListener("dashboard-alert-open", onAlertOpen);
    return () => window.removeEventListener("dashboard-alert-open", onAlertOpen);
  }, []);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerWidthRef = useRef(0);
  const reelRef = useRef<HTMLDivElement>(null);

  // Sync alert counts to PortalLayout's fixed AlertBar shell.
  // Write to the module-level store first (read by PortalLayout's useState
  // initialiser to avoid a race), then dispatch the event for subsequent updates.
  useEffect(() => {
    const counts = {
      longRunningCount: data.longRunningSessions.length,
      staleSemesterCount: data.staleSemesters.length,
      pendingDisputeCount: data.pendingDisputes,
    };
    setDashboardAlertStore(counts);
    window.dispatchEvent(new CustomEvent("dashboard-alerts", { detail: counts }));
    return () => {
      setDashboardAlertStore(null);
      window.dispatchEvent(
        new CustomEvent("dashboard-alerts", {
          detail: { longRunningCount: 0, staleSemesterCount: 0, pendingDisputeCount: 0 },
        })
      );
    };
  }, [data.longRunningSessions.length, data.staleSemesters.length, data.pendingDisputes]);

  const { containerRef: swipeRef } = usePageSwipe({
    activeIndex,
    tabCount: tabs.length,
    tabIds: tabs,
    onTabChange: (tabId) => {
      const newTab: Tab =
        tabId === "oversight" || tabId === "calendar" ? "oversight" : "live";
      setActiveTab(newTab);
      setDragOffset(0);
      setIsDragging(false);
    },
  });

  useEffect(() => {
    if (reelRef.current) {
      containerWidthRef.current = reelRef.current.offsetWidth;
    }
    const onResize = () => {
      if (reelRef.current) containerWidthRef.current = reelRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function onTabChange(e: Event) {
      const detail = (e as CustomEvent<{ tabId: string }>).detail;
      const rawTab = detail.tabId;
      const newTab: Tab =
        rawTab === "oversight" || rawTab === "calendar" ? "oversight" : "live";
      setActiveTab(newTab);
      setDragOffset(0);
      setIsDragging(false);
    }
    window.addEventListener("topbar-tab-change", onTabChange);
    return () => window.removeEventListener("topbar-tab-change", onTabChange);
  }, []);

  useEffect(() => {
    function onDragProgress(e: Event) {
      const detail = (e as CustomEvent<{
        dragOffset: number;
        containerWidth: number;
        activeIndex: number;
      }>).detail;

      const diff = detail.dragOffset;
      const dragging = diff !== 0;
      setIsDragging(dragging);

      if (!dragging) {
        setDragOffset(0);
        return;
      }

      const w = containerWidthRef.current || detail.containerWidth || 1;
      const topbarW = detail.containerWidth || 1;
      const reelW = w;
      const scaledOffset = (diff / topbarW) * reelW;

      const curIdx = detail.activeIndex;
      if (
        (curIdx === 0 && scaledOffset > 0) ||
        (curIdx === tabs.length - 1 && scaledOffset < 0)
      ) {
        setDragOffset(scaledOffset * 0.15);
      } else {
        setDragOffset(scaledOffset);
      }
    }
    window.addEventListener("topbar-drag-progress", onDragProgress);
    return () => window.removeEventListener("topbar-drag-progress", onDragProgress);
  }, [tabs.length]);

  const translateX = `calc(${-activeIndex * 50}% + ${dragOffset / 2}px)`;

  const w = containerWidthRef.current || 1;
  const dragFraction = dragOffset / w;
  const pageProgress = activeIndex - dragFraction;

  const panelStyle = (index: number): React.CSSProperties => ({
    opacity: Math.max(0.25, 1 - Math.abs(pageProgress - index) * 0.75),
    transform: `scale(${1 - Math.abs(pageProgress - index) * 0.03})`,
    transition: isDragging ? "none" : "opacity 380ms ease, transform 380ms ease",
    pointerEvents: activeIndex === index ? "auto" : "none",
  });


  return (
    <div className={styles.root}>
      <AlertSheet
        open={alertSheetOpen}
        onClose={() => setAlertSheetOpen(false)}
        longRunningSessions={data.longRunningSessions}
        staleSemesters={data.staleSemesters}
        pendingDisputeCount={data.pendingDisputes}
      />
      <div
        ref={(el) => {
          (reelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          (swipeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={styles.reelViewport}
      >
        <div
          className={styles.reelTrack}
          style={{
            transform: `translateX(${translateX})`,
            transition: isDragging
              ? "none"
              : "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* ══════════════════════════════ LIVE PANEL ══════════════════ */}
          <div
            className={`${styles.panel} ${styles.panelLeft}`}
            style={panelStyle(0)}
          >
            <div className={styles.panelStack}>

              {/* Day summary banner */}
              <DaySummaryBanner
                sessionsToday={data.sessionsToday}
                liveSessions={data.liveSessions}
              />

              {/* Live Sessions Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <span
                      className={`${styles.liveDot} ${
                        data.liveSessions.length > 0 ? styles.liveDotActive : styles.liveDotIdle
                      }`}
                    />
                    <h2 className={styles.cardTitle}>Live Class Sessions</h2>
                  </div>
                  {data.liveSessions.length > 0 && (
                    <span className={styles.countBadge}>
                      {data.liveSessions.length} active now
                    </span>
                  )}
                </div>

                {data.liveSessions.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Activity
                      size={28}
                      strokeWidth={1.75}
                      className={styles.emptyStateIcon}
                    />
                    <p className={styles.emptyStateTitle}>No active sessions right now</p>
                    <p className={styles.emptyStateSub}>
                      Check-ins will appear here as soon as lecturers launch sessions.
                    </p>
                  </div>
                ) : (
                  <div className={styles.sessionList}>
                    {data.liveSessions.map((session) => {
                      const course = session.courses as {
                        name: string;
                        code: string;
                        groups: { group_name: string } | null;
                      } | null;
                      const ratio = session.group_size > 0
                        ? Math.min(1, session.check_in_count / session.group_size)
                        : 0;
                      const circumference = 2 * Math.PI * 10;
                      const arcOffset = circumference * (1 - ratio);
                      return (
                        <button
                          key={session.id}
                          className={styles.sessionTile}
                          onClick={() => setSelectedSession({
                            id: session.id,
                            started_at: session.started_at,
                            venue: session.venue,
                            check_in_count: session.check_in_count,
                            group_size: session.group_size,
                            opened_by_name: session.opened_by_name,
                            opened_by_role: session.opened_by_role,
                            courses: course ? {
                              name: course.name,
                              code: course.code,
                              groups: course.groups,
                            } : null,
                          })}
                          aria-label={`View details for ${course?.name ?? "session"}`}
                        >
                          <div className={styles.tileLeft}>
                            {/* Mini arc — signature detail */}
                            <div className={styles.tileArcWrap} aria-hidden="true">
                              <svg width={28} height={28} viewBox="0 0 28 28">
                                <circle cx={14} cy={14} r={10} fill="none" stroke="var(--color-surface-3)" strokeWidth={3} />
                                <circle
                                  cx={14} cy={14} r={10}
                                  fill="none"
                                  stroke="var(--color-text-primary)"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={arcOffset}
                                  transform="rotate(-90 14 14)"
                                />
                              </svg>
                            </div>
                            <div className={styles.sessionMeta}>
                              <div className={styles.sessionName}>
                                {course?.name ?? "Course Session"}
                                {course?.code && (
                                  <span className={styles.sessionCode}> · {course.code}</span>
                                )}
                              </div>
                              <div className={styles.sessionSub}>
                                {course?.groups?.group_name ?? "All Groups"}
                                {session.venue && ` · ${session.venue}`}
                              </div>
                            </div>
                          </div>
                          <div className={styles.tileRight}>
                            <div className={styles.sessionElapsed}>
                              <Clock size={12} strokeWidth={1.75} style={{ color: "var(--color-text-meta)" }} />
                              <span className={styles.elapsedValue}>{elapsed(session.started_at)}</span>
                            </div>
                            <div className={styles.tileCheckins}>
                              {session.check_in_count}/{session.group_size}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════ OVERSIGHT PANEL ═════════════ */}
          <div
            className={`${styles.panel} ${styles.panelRight}`}
            style={panelStyle(1)}
          >
            <div className={styles.panelStack}>
              {/* System health stat cards */}
              <OversightStats
                semesterLabel={data.semesterLabel}
                activeStudents={data.activeStudents}
                activeLecturers={data.activeLecturers}
                sessionsToday={data.sessionsToday}
                pendingDisputes={data.pendingDisputes}
              />

              {/* Recent Audit Events */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <History size={18} strokeWidth={1.75} style={{ color: "var(--color-text-secondary)" }} />
                    <h2 className={styles.cardTitle}>Recent Audit Events</h2>
                  </div>
                </div>

                {data.auditEvents.length === 0 ? (
                  <p className={styles.emptyStateTitle}>No audit events recorded yet.</p>
                ) : (
                  <div className={styles.auditList}>
                    {data.auditEvents.map((event, index) => {
                      const ts = new Date(event.created_at);
                      const timeStr = ts.toLocaleTimeString("en-GH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const dateStr = ts.toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                      });
                      const isToday = ts.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={event.id}
                          className={`${styles.auditRow} ${
                            index < data.auditEvents.length - 1 ? styles.auditRowBordered : ""
                          }`}
                        >
                          <div>
                            <div className={styles.auditAction}>{event.action}</div>
                            {event.table_name && (
                              <div className={styles.auditTable}>
                                <code className={styles.auditTableChip}>
                                  {event.table_name}
                                </code>
                              </div>
                            )}
                          </div>
                          <span className={styles.auditTime}>
                            {isToday ? timeStr : dateStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <SessionDetailSheet
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
