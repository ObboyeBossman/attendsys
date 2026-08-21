"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity, History, Clock, AlertTriangle, CalendarClock } from "lucide-react";
import { DashboardStats } from "./DashboardStats";

/* ── Types ─────────────────────────────────────────────────────────────── */

type LiveSession = {
  id: string;
  started_at: string;
  venue: string | null;
  courses: {
    name: string;
    code: string;
    groups: { group_name: string } | null;
  } | null;
};

type AuditEvent = {
  id: number;
  action: string;
  table_name: string | null;
  created_at: string;
  actor_id: string | null;
};

type StaleSemester = {
  id: string;
  name: string;
  start_date: string;
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
    longRunningSessions: LiveSession[];
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
  const [activeTab, setActiveTab] = useState<"live" | "oversight">("live");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const prevTab = useRef<"live" | "oversight">("live");

  const totalAlerts = data.longRunningSessions.length + data.staleSemesters.length;

  useEffect(() => {
    function onTabChange(e: Event) {
      const detail = (e as CustomEvent<{ tabId: string }>).detail;
      const rawTab = detail.tabId;
      const newTab: "live" | "oversight" =
        rawTab === "oversight" || rawTab === "calendar" ? "oversight" : "live";

      if (newTab === prevTab.current) return;

      const dir = newTab === "oversight" ? "left" : "right";
      setSlideDirection(dir);
      setIsTransitioning(true);
      prevTab.current = newTab;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActiveTab(newTab);
          setTimeout(() => setIsTransitioning(false), 220);
        });
      });
    }

    window.addEventListener("topbar-tab-change", onTabChange);
    return () => window.removeEventListener("topbar-tab-change", onTabChange);
  }, []);

  const stats = [
    {
      label: "Active Semester",
      value: data.semesterLabel === "None" ? "—" : data.semesterLabel,
      accent: "var(--color-primary)",
      sub: data.semesterLabel === "None" ? "No active semester" : "Current semester",
    },
    {
      label: "Active Students",
      value: data.activeStudents.toLocaleString(),
      accent: "var(--color-success)",
      sub: "Enrolled & active",
    },
    {
      label: "Active Lecturers",
      value: data.activeLecturers.toLocaleString(),
      accent: "var(--color-primary)",
      sub: "Assigned to courses",
    },
    {
      label: "Sessions Today",
      value: data.sessionsToday.toLocaleString(),
      accent: "var(--color-warning)",
      sub: new Date().toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "short" }),
    },
    {
      label: "Pending Disputes",
      value: data.pendingDisputes.toLocaleString(),
      accent: "var(--color-danger)",
      sub: "System-wide",
    },
  ];

  /* ── Shared card shell ──────────────────────────────────────────────── */
  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-xl)",
    padding: "var(--space-6)",
    boxShadow: "var(--shadow-card)",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Page header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "var(--tracking-tight)",
            margin: 0,
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-1)",
          }}
        >
          System overview and live monitoring
        </p>
      </div>

      {/* ── Smooth Tab Content Container ──────────────────────────────── */}
      <div
        style={{
          transition:
            "opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning
            ? slideDirection === "left"
              ? "translateX(-16px)"
              : "translateX(16px)"
            : "translateX(0)",
        }}
      >
        {/* ════════════════════════════════════════════ LIVE TAB ══════ */}
        {activeTab === "live" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

            {/* System Alerts — only shown when conditions exist */}
            {totalAlerts > 0 && (
              <div
                style={{
                  ...cardStyle,
                  border: "1px solid rgba(217, 119, 6, 0.25)",
                  background: "rgba(217, 119, 6, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <AlertTriangle
                    size={18}
                    strokeWidth={1.75}
                    style={{ color: "var(--color-warning)", flexShrink: 0 }}
                  />
                  <h2
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "var(--color-warning)",
                      margin: 0,
                    }}
                  >
                    System Alerts
                    <span
                      style={{
                        marginLeft: "var(--space-2)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        background: "rgba(217, 119, 6, 0.15)",
                        color: "var(--color-warning)",
                        borderRadius: "var(--radius-full)",
                        padding: "2px 8px",
                      }}
                    >
                      {totalAlerts}
                    </span>
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {/* Long-running session alerts */}
                  {data.longRunningSessions.map((session) => {
                    const course = session.courses as { name: string; code: string } | null;
                    return (
                      <div
                        key={session.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          padding: "var(--space-3) var(--space-4)",
                          background: "var(--color-surface)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid rgba(217, 119, 6, 0.15)",
                        }}
                      >
                        <Clock
                          size={16}
                          strokeWidth={1.75}
                          style={{ color: "var(--color-warning)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "var(--text-sm)",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {course?.name ?? "Session"}{" "}
                            {course?.code && (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "var(--color-text-meta)",
                                  fontSize: "var(--text-xs)",
                                }}
                              >
                                ({course.code})
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--color-text-secondary)",
                              marginTop: 2,
                            }}
                          >
                            Running for{" "}
                            <strong style={{ color: "var(--color-warning)" }}>
                              {elapsed(session.started_at)}
                            </strong>{" "}
                            — may have been left open accidentally
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Stale semester alerts */}
                  {data.staleSemesters.map((sem) => (
                    <div
                      key={sem.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        padding: "var(--space-3) var(--space-4)",
                        background: "var(--color-surface)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(217, 119, 6, 0.15)",
                      }}
                    >
                      <CalendarClock
                        size={16}
                        strokeWidth={1.75}
                        style={{ color: "var(--color-warning)", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "var(--text-sm)",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {sem.name}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          Start date{" "}
                          <strong style={{ color: "var(--color-warning)" }}>
                            {new Date(sem.start_date).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </strong>{" "}
                          has passed — activate this semester
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Sessions Card */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        data.liveSessions.length > 0
                          ? "var(--color-success)"
                          : "var(--color-text-meta)",
                      boxShadow:
                        data.liveSessions.length > 0
                          ? "0 0 0 3px var(--color-success-subtle)"
                          : "none",
                      animation:
                        data.liveSessions.length > 0 ? "pulse 2s infinite" : "none",
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-lg)",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      margin: 0,
                    }}
                  >
                    Live Class Sessions
                  </h2>
                </div>
                {data.liveSessions.length > 0 && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      background: "var(--color-success-subtle)",
                      color: "var(--color-success)",
                      borderRadius: "var(--radius-full)",
                      padding: "4px 12px",
                    }}
                  >
                    {data.liveSessions.length} active now
                  </span>
                )}
              </div>

              {data.liveSessions.length === 0 ? (
                <div
                  style={{
                    padding: "var(--space-8) var(--space-4)",
                    textAlign: "center",
                    background: "var(--color-sunken)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <Activity
                    size={28}
                    strokeWidth={1.75}
                    style={{
                      color: "var(--color-text-meta)",
                      display: "block",
                      margin: "0 auto var(--space-2)",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    No active sessions right now
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-meta)",
                      fontSize: "var(--text-xs)",
                      marginTop: "var(--space-1)",
                    }}
                  >
                    Check-ins will appear here as soon as lecturers launch sessions.
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
                >
                  {data.liveSessions.map((session) => {
                    const course = session.courses as {
                      name: string;
                      code: string;
                      groups: { group_name: string } | null;
                    } | null;

                    return (
                      <div
                        key={session.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-4)",
                          padding: "var(--space-4)",
                          background: "var(--color-sunken)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-3)",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "var(--radius-md)",
                              background: "var(--color-surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-brand)",
                              flexShrink: 0,
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            <Activity size={18} strokeWidth={1.75} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 600,
                                fontSize: "var(--text-sm)",
                                color: "var(--color-text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {course?.name ?? "Course Session"}
                              {course?.code && (
                                <span
                                  style={{
                                    marginLeft: "var(--space-2)",
                                    fontSize: "var(--text-xs)",
                                    color: "var(--color-text-meta)",
                                    fontWeight: 400,
                                  }}
                                >
                                  ({course.code})
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--color-text-secondary)",
                                marginTop: 2,
                              }}
                            >
                              {course?.groups?.group_name ?? "All Groups"}
                              {session.venue && ` · ${session.venue}`}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            flexShrink: 0,
                          }}
                        >
                          <Clock
                            size={14}
                            strokeWidth={1.75}
                            style={{ color: "var(--color-text-meta)" }}
                          />
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "var(--text-xs)",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {elapsed(session.started_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ OVERSIGHT TAB ══ */}
        {activeTab === "oversight" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {/* System health stat cards */}
            <DashboardStats stats={stats} />

            {/* Recent Audit Events */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <History
                  size={18}
                  strokeWidth={1.75}
                  style={{ color: "var(--color-text-secondary)" }}
                />
                <h2
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  Recent Audit Events
                </h2>
              </div>

              {data.auditEvents.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  No audit events recorded yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
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
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "var(--space-4)",
                          padding: "var(--space-3) 0",
                          borderBottom:
                            index < data.auditEvents.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "var(--text-sm)",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {event.action}
                          </div>
                          {event.table_name && (
                            <div
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--color-text-meta)",
                                marginTop: 2,
                              }}
                            >
                              <code
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "var(--text-2xs)",
                                  background: "var(--color-sunken)",
                                  padding: "1px 5px",
                                  borderRadius: "var(--radius-sm)",
                                }}
                              >
                                {event.table_name}
                              </code>
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-meta)",
                            flexShrink: 0,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {isToday ? timeStr : dateStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
