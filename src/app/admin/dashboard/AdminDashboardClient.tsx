"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity, ShieldAlert, History, Users, School, Clock, FileText } from "lucide-react";
import { DashboardStats } from "./DashboardStats";

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

interface AdminDashboardClientProps {
  data: {
    semesterLabel: string;
    activeStudents: number;
    activeLecturers: number;
    sessionsToday: number;
    pendingDisputes: number;
    liveSessions: LiveSession[];
    auditEvents: AuditEvent[];
  };
}

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"live" | "oversight">("live");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const prevTab = useRef<"live" | "oversight">("live");

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
      accent: "var(--color-info)",
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

  return (
    <div style={{ position: "relative", minHeight: "80vh" }}>
      {/* Header section */}
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Dashboard
          </h1>
          <p className="page-subtitle" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            System overview and live monitoring
          </p>
        </div>
      </div>

      {/* Smooth Tab Switcher Content Container */}
      <div
        style={{
          transition: "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: isTransitioning ? 0.3 : 1,
          transform: isTransitioning
            ? slideDirection === "left"
              ? "translateX(-12px)"
              : "translateX(12px)"
            : "translateX(0)",
        }}
      >
        {activeTab === "live" ? (
          /* ── LIVE VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {/* Live sessions monitor card */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: data.liveSessions.length > 0 ? "var(--color-success)" : "var(--color-text-meta)",
                      boxShadow: data.liveSessions.length > 0 ? "0 0 0 3px var(--color-success-subtle)" : "none",
                    }}
                  />
                  <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
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
                  <Activity size={28} strokeWidth={1.75} style={{ color: "var(--color-text-meta)", marginBottom: "var(--space-2)" }} />
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", margin: 0, fontWeight: 500 }}>
                    No active class sessions running right now.
                  </p>
                  <p style={{ color: "var(--color-text-meta)", fontSize: "var(--text-xs)", marginTop: "var(--space-1)" }}>
                    Real-time class check-ins will appear here as soon as lecturers launch sessions.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {data.liveSessions.map((session) => {
                    const course = session.courses as { name: string; code: string; groups: { group_name: string } | null } | null;
                    const startedAt = new Date(session.started_at);
                    const minutesAgo = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 60000));
                    const timeLabel = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m ago`;

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
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
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
                            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {course?.name ?? "Course Session"}
                              {course?.code && (
                                <span style={{ marginLeft: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-text-meta)", fontWeight: 400 }}>
                                  ({course.code})
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
                              {course?.groups?.group_name ?? "All Groups"}
                              {session.venue && ` · ${session.venue}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
                          <Clock size={14} strokeWidth={1.75} style={{ color: "var(--color-text-meta)" }} />
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                            {timeLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── OVERSIGHT VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {/* System statistics */}
            <DashboardStats stats={stats} />

            {/* Audit log feed */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                <History size={18} strokeWidth={1.75} style={{ color: "var(--color-text-secondary)" }} />
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                  Recent System Audit Events
                </h2>
              </div>

              {data.auditEvents.length === 0 ? (
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                  No audit log events recorded yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data.auditEvents.map((event, index) => {
                    const ts = new Date(event.created_at);
                    const timeStr = ts.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
                    const dateStr = ts.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
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
                          borderBottom: index < data.auditEvents.length - 1 ? "1px solid var(--color-border)" : "none",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                            {event.action}
                          </div>
                          {event.table_name && (
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-meta)", marginTop: 2 }}>
                              Target: <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)" }}>{event.table_name}</code>
                            </div>
                          )}
                        </div>
                        <span
                          style={{
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
