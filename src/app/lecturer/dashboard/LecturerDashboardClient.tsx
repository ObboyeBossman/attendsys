"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ── helpers ─────────────────────────────────────────────── */
function elapsed(startedAt: string) {
  const ms = Date.now() - new Date(startedAt).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  if (isToday) return `Today · ${fmtTime(iso)}`;
  return d.toLocaleDateString("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function attendanceRate(present: number, total: number) {
  if (total === 0) return "—";
  return `${Math.round((present / total) * 100)}%`;
}

/* ── types ───────────────────────────────────────────────── */
export type DashboardData = {
  lecturerName: string;
  semesterName: string | null;
  totalCourses: number;
  totalSessions: number;
  totalStudents: number;
  overallRate: string;
  pendingDisputes: number;
  liveSession: {
    id: string;
    started_at: string;
    venue: string | null;
    courses: { id: string; name: string; code: string; group_id: string } | null;
  } | null;
  liveCheckins: number;
  liveTotal: number;
  recentSessions: {
    id: string;
    started_at: string;
    courseName: string;
    courseCode: string;
    checkedIn: number;
    rate: string;
  }[];
};

/* ── stat card data ──────────────────────────────────────── */
function buildStats(d: DashboardData) {
  return [
    {
      label: "My Courses",
      value: String(d.totalCourses),
      accent: "var(--color-secondary)",
      sub: d.semesterName ? `This semester` : "No active semester",
    },
    {
      label: "Sessions Run",
      value: String(d.totalSessions),
      accent: "var(--color-warning)",
      sub: d.semesterName ?? "This semester",
    },
    {
      label: "Students",
      value: String(d.totalStudents),
      accent: "var(--color-success)",
      sub: "Across my groups",
    },
    {
      label: "Attendance Rate",
      value: d.overallRate,
      accent: "var(--color-info)",
      sub: "Overall average",
    },
    {
      label: "Disputes",
      value: String(d.pendingDisputes),
      accent:
        d.pendingDisputes > 0
          ? "var(--color-danger)"
          : "var(--color-text-3)",
      sub:
        d.pendingDisputes > 0
          ? "Needs your attention"
          : "All clear",
    },
  ];
}

/* ── Calendar helpers ────────────────────────────────────── */
type CalSession = DashboardData["recentSessions"][0];

function groupByMonth(sessions: CalSession[]) {
  const map = new Map<string, CalSession[]>();
  for (const s of sessions) {
    const d = new Date(s.started_at);
    const key = d.toLocaleDateString("en-GH", { month: "long", year: "numeric" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

function rateColor(rate: string): string {
  const n = parseInt(rate);
  if (isNaN(n)) return "var(--color-text-3)";
  if (n >= 75) return "var(--color-success)";
  if (n >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

/* ── Sub-components ──────────────────────────────────────── */

function StatCards({ stats }: { stats: ReturnType<typeof buildStats> }) {
  return (
    <>
      {/* Scrollable strip (mobile/tablet ≤1024px) */}
      <div className="stats-scroll-wrap">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card stats-scroll-card"
            style={{ "--accent": stat.accent } as React.CSSProperties}
          >
            <span className="stat-card-label">{stat.label}</span>
            <span className="stat-card-value">{stat.value}</span>
            <span className="stat-card-sub">{stat.sub}</span>
          </div>
        ))}
      </div>
      {/* Wrapping grid (desktop >1024px) */}
      <div className="stats-grid-wrap">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ "--accent": stat.accent } as React.CSSProperties}
          >
            <span className="stat-card-label">{stat.label}</span>
            <span className="stat-card-value">{stat.value}</span>
            <span className="stat-card-sub">{stat.sub}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function LiveSessionCard({
  session,
  checkins,
  total,
}: {
  session: NonNullable<DashboardData["liveSession"]>;
  checkins: number;
  total: number;
}) {
  const [elapsedStr, setElapsedStr] = useState(elapsed(session.started_at));
  useEffect(() => {
    const id = setInterval(() => setElapsedStr(elapsed(session.started_at)), 30000);
    return () => clearInterval(id);
  }, [session.started_at]);

  const pct = total > 0 ? Math.round((checkins / total) * 100) : 0;

  return (
    <div
      className="card"
      style={{
        border: "1px solid rgba(34,197,94,0.35)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.06), transparent)",
        minWidth: 0,
        overflow: "hidden",
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
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-success)",
            boxShadow: "0 0 0 3px rgba(34,197,94,.25)",
            animation: "live-pulse 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            color: "var(--color-success)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Session Live
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-3)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {elapsedStr} elapsed
        </span>
      </div>

      <div style={{ marginBottom: "var(--space-4)", minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {session.courses?.name ?? "Unknown Course"}
        </div>
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-3)",
            marginTop: 2,
          }}
        >
          {session.courses?.code}
          {session.venue && ` · ${session.venue}`}
          {` · Started ${fmtTime(session.started_at)}`}
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-5)", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--space-2)",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-2)",
              fontWeight: 600,
            }}
          >
            Check-ins
          </span>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--color-text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {checkins} / {total}
            <span
              style={{
                fontWeight: 400,
                color: "var(--color-text-3)",
                marginLeft: 4,
              }}
            >
              ({pct}%)
            </span>
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background:
                pct >= 75
                  ? "var(--color-success)"
                  : pct >= 50
                  ? "var(--color-warning)"
                  : "var(--color-danger)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      <Link
        href={`/lecturer/sessions/${session.id}`}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 10h16M10 4l6 6-6 6" />
        </svg>
        Manage Session
      </Link>
    </div>
  );
}

function NoSessionCard({ hasCourses }: { hasCourses: boolean }) {
  return (
    <div
      className="card"
      style={{ textAlign: "center", padding: "var(--space-10) var(--space-6)" }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto var(--space-4)",
          color: "var(--color-text-3)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "var(--text-base)",
          color: "var(--color-text)",
          marginBottom: "var(--space-1)",
        }}
      >
        No Active Session
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-3)",
          marginBottom: "var(--space-5)",
          lineHeight: 1.6,
        }}
      >
        {hasCourses
          ? "Pick a course and start taking attendance."
          : "You have no courses assigned this semester."}
      </p>
      {hasCourses && (
        <Link href="/lecturer/courses" className="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="9" />
            <path d="M10 6v8M6 10h8" />
          </svg>
          Start a Session
        </Link>
      )}
    </div>
  );
}

/* ── Today view ──────────────────────────────────────────── */
function TodayView({ d }: { d: DashboardData }) {
  const stats = buildStats(d);

  return (
    <div className="dashboard-tab-panel">
      {/* Stats */}
      <StatCards stats={stats} />

      {/* Mobile disputes banner */}
      {d.pendingDisputes > 0 && (
        <Link
          href="/lecturer/disputes"
          className="dashboard-disputes-mobile"
          style={{
            display: "none",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-danger-bg)",
            border: "1px solid rgba(239,68,68,0.25)",
            textDecoration: "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ color: "var(--color-danger)", flexShrink: 0 }}
          >
            <path d="M10 3L2 17h16L10 3z" />
            <path d="M10 10v3M10 15h.01" />
          </svg>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--color-danger)",
            }}
          >
            {d.pendingDisputes} pending dispute
            {d.pendingDisputes !== 1 ? "s" : ""} — tap to review
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            style={{
              color: "var(--color-danger)",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <path d="M7 5l5 5-5 5" />
          </svg>
        </Link>
      )}

      <div className="dashboard-lower-grid">
        {/* ── Main column ── */}
        <div>
          {d.liveSession ? (
            <LiveSessionCard
              session={d.liveSession}
              checkins={d.liveCheckins}
              total={d.liveTotal}
            />
          ) : (
            <NoSessionCard hasCourses={d.totalCourses > 0} />
          )}

          {/* Recent sessions */}
          <div
            className="card"
            style={{ marginTop: "var(--space-6)", minWidth: 0, overflow: "hidden" }}
          >
            <h2
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                color: "var(--color-text)",
              }}
            >
              Recent Sessions
            </h2>

            {d.recentSessions.length === 0 ? (
              <p style={{ color: "var(--color-text-3)", fontSize: "var(--text-sm)" }}>
                No sessions held yet
                {d.semesterName ? ` in ${d.semesterName}` : ""}.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                {d.recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/lecturer/sessions/${s.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-lg)",
                      textDecoration: "none",
                      transition: "background var(--transition-fast)",
                    }}
                    className="recent-session-row"
                  >
                    {/* Date chip */}
                    <div
                      style={{
                        width: 44,
                        flexShrink: 0,
                        textAlign: "center",
                        background: "var(--color-surface-2)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-2) 0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--color-text-3)",
                          textTransform: "uppercase",
                        }}
                      >
                        {new Date(s.started_at).toLocaleDateString("en-GH", {
                          month: "short",
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-lg)",
                          fontWeight: 800,
                          color: "var(--color-text)",
                          lineHeight: 1,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {new Date(s.started_at).getDate()}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "var(--text-sm)",
                          color: "var(--color-text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.courseName}
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-3)",
                            fontWeight: 400,
                          }}
                        >
                          {s.courseCode}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-3)",
                          marginTop: 2,
                        }}
                      >
                        {fmtDate(s.started_at)}
                      </div>
                    </div>

                    {/* Rate */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          color: rateColor(s.rate),
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {s.rate}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-3)",
                        }}
                      >
                        {s.checkedIn} present
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
          {/* Quick actions */}
          <div className="card">
            <h2
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                color: "var(--color-text)",
              }}
            >
              Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link href="/lecturer/courses" className="btn btn-primary" style={{ justifyContent: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="9" /><path d="M10 6v8M6 10h8" />
                </svg>
                Start a Session
              </Link>
              <Link href="/lecturer/sessions" className="btn btn-secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="5" width="12" height="10" rx="1.5" /><path d="M14 8l5-3v9l-5-3" />
                </svg>
                All Sessions
              </Link>
              <Link href="/lecturer/groups" className="btn btn-secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="7" cy="6" r="3" /><circle cx="13" cy="6" r="3" /><path d="M1 18c0-3.31 2.69-6 6-6M13 12c3.31 0 6 2.69 6 6" />
                </svg>
                My Groups
              </Link>
              <Link href="/lecturer/disputes" className="btn btn-secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 3L2 17h16L10 3z" /><path d="M10 10v3M10 15h.01" />
                </svg>
                Disputes
                {d.pendingDisputes > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      minWidth: 20,
                      height: 20,
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-danger)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                    }}
                  >
                    {d.pendingDisputes}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Disputes callout */}
          {d.pendingDisputes > 0 && (
            <Link
              href="/lecturer/disputes"
              style={{
                display: "block",
                padding: "var(--space-4) var(--space-5)",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-danger-bg)",
                border: "1px solid rgba(239,68,68,0.25)",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-danger)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 3L2 17h16L10 3z" /><path d="M10 10v3M10 15h.01" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>
                    {d.pendingDisputes} Pending Dispute{d.pendingDisputes !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                    Review and resolve
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Semester badge */}
          <div className="card" style={{ padding: "var(--space-4) var(--space-5)" }}>
            <div
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--space-2)",
              }}
            >
              Active Semester
            </div>
            {d.semesterName ? (
              <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                {d.semesterName}
              </div>
            ) : (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-warning)" }}>
                No active semester — contact admin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Calendar view ───────────────────────────────────────── */
function CalendarView({ d }: { d: DashboardData }) {
  const grouped = groupByMonth(d.recentSessions);
  const today = new Date();
  const todaySessions = d.recentSessions.filter(
    (s) => new Date(s.started_at).toDateString() === today.toDateString()
  );

  return (
    <div className="dashboard-tab-panel">
      {/* Today's sessions hero */}
      <div
        className="card"
        style={{
          marginBottom: "var(--space-6)",
          background: todaySessions.length > 0
            ? "linear-gradient(135deg, rgba(26,66,194,0.06), transparent)"
            : undefined,
          border: todaySessions.length > 0
            ? "1px solid rgba(26,66,194,0.18)"
            : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="16" height="15" rx="2" />
            <path d="M6 1v3M14 1v3M2 8h16" />
          </svg>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Today ·{" "}
            {today.toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        {todaySessions.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--space-6) 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-3)",
                color: "var(--color-text-3)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", lineHeight: 1.6 }}>
              No sessions scheduled for today.
            </p>
            {d.totalCourses > 0 && (
              <Link href="/lecturer/courses" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>
                Start one now
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {todaySessions.map((s) => (
              <Link
                key={s.id}
                href={`/lecturer/sessions/${s.id}`}
                className="recent-session-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition: "background var(--transition-fast)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.courseName}
                    <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", color: "var(--color-text-3)", fontWeight: 400 }}>{s.courseCode}</span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                    {fmtTime(s.started_at)}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: rateColor(s.rate), fontVariantNumeric: "tabular-nums" }}>{s.rate}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>{s.checkedIn} present</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Month-grouped sessions */}
      {d.recentSessions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {Array.from(grouped.entries()).map(([month, sessions]) => (
            <div key={month}>
              {/* Month heading */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-3)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    color: "var(--color-text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {month}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Session cards for this month */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {sessions.map((s) => {
                  const d = new Date(s.started_at);
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <Link
                      key={s.id}
                      href={`/lecturer/sessions/${s.id}`}
                      className="recent-session-row cal-session-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-xl)",
                        textDecoration: "none",
                        background: isToday ? "rgba(26,66,194,0.05)" : "var(--color-surface)",
                        border: isToday ? "1px solid rgba(26,66,194,0.15)" : "1px solid var(--color-border)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "box-shadow 180ms ease, transform 180ms ease",
                      }}
                    >
                      {/* Date chip */}
                      <div
                        style={{
                          width: 44,
                          flexShrink: 0,
                          textAlign: "center",
                          background: isToday ? "rgba(26,66,194,0.12)" : "var(--color-surface-2)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-2) 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: isToday ? "var(--color-primary)" : "var(--color-text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {d.toLocaleDateString("en-GH", { weekday: "short" })}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-lg)",
                            fontWeight: 800,
                            color: isToday ? "var(--color-primary)" : "var(--color-text)",
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {d.getDate()}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.courseName}
                          <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", color: "var(--color-text-3)", fontWeight: 400 }}>
                            {s.courseCode}
                          </span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                          {fmtTime(s.started_at)}
                          {isToday && (
                            <span
                              style={{
                                marginLeft: 6,
                                display: "inline-block",
                                background: "var(--color-primary)",
                                color: "#fff",
                                borderRadius: "var(--radius-full)",
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                lineHeight: 1.6,
                                letterSpacing: "0.04em",
                              }}
                            >
                              Today
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rate */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: rateColor(s.rate), fontVariantNumeric: "tabular-nums" }}>
                          {s.rate}
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                          {s.checkedIn} present
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ color: "var(--color-text-3)", flexShrink: 0 }}>
                        <path d="M7 5l5 5-5 5" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-10) var(--space-6)" }}>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", lineHeight: 1.6 }}>
            No sessions recorded yet{d.semesterName ? ` in ${d.semesterName}` : ""}.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export function LecturerDashboardClient({ data }: { data: DashboardData }) {
  const tabs = ["today", "calendar"] as const;
  type Tab = typeof tabs[number];

  const [activeTab, setActiveTab] = useState<Tab>("today");
  const activeIndex = tabs.indexOf(activeTab);

  // Drag state — driven by TopBar topbar-drag-progress events
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef(0);

  useEffect(() => {
    if (reelRef.current) containerWidthRef.current = reelRef.current.offsetWidth;
    const onResize = () => {
      if (reelRef.current) containerWidthRef.current = reelRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Tab switch from TopBar
  useEffect(() => {
    function onTabChange(e: Event) {
      const detail = (e as CustomEvent<{ tabId: string }>).detail;
      const rawTab = detail.tabId;
      const newTab: Tab = (rawTab === "oversight" || rawTab === "calendar") ? "calendar" : "today";
      setActiveTab(newTab);
      setDragOffset(0);
      setIsDragging(false);
    }
    window.addEventListener("topbar-tab-change", onTabChange);
    return () => window.removeEventListener("topbar-tab-change", onTabChange);
  }, []);

  // Real-time drag follow from TopBar
  useEffect(() => {
    function onDragProgress(e: Event) {
      const detail = (e as CustomEvent<{ dragOffset: number; containerWidth: number; activeIndex: number }>).detail;
      const diff = detail.dragOffset;
      const dragging = diff !== 0;
      setIsDragging(dragging);
      if (!dragging) { setDragOffset(0); return; }

      const topbarW = detail.containerWidth || 1;
      const reelW = containerWidthRef.current || topbarW;
      const scaledOffset = (diff / topbarW) * reelW;
      const curIdx = detail.activeIndex;

      if ((curIdx === 0 && scaledOffset > 0) || (curIdx === tabs.length - 1 && scaledOffset < 0)) {
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
    <>
      {/* Disputes badge — floated above reel, only shown when pending */}
      {data.pendingDisputes > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-3)" }}>
          <Link
            href="/lecturer/disputes"
            className="btn btn-danger btn-sm dashboard-disputes-btn"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3L2 17h16L10 3z" /><path d="M10 10v3M10 15h.01" />
            </svg>
            {data.pendingDisputes} dispute{data.pendingDisputes !== 1 ? "s" : ""}
          </Link>
        </div>
      )}

      {/* ── Drag-synced content reel ──────────────────────────────── */}
      <div ref={reelRef} style={{ overflow: "hidden", position: "relative" }}>
        <div
          style={{
            display: "flex",
            width: "200%",
            transform: `translateX(${translateX})`,
            transition: isDragging ? "none" : "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",
          }}
        >
          {/* TODAY panel */}
          <div style={{ width: "50%", paddingRight: "var(--space-2)", ...panelStyle(0) }}>
            <TodayView d={data} />
          </div>

          {/* CALENDAR panel */}
          <div style={{ width: "50%", paddingLeft: "var(--space-2)", ...panelStyle(1) }}>
            <CalendarView d={data} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes live-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,.25); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,.05); }
        }

        /* ── Row hover ── */
        .recent-session-row:hover { background: var(--color-surface-2) !important; }
        .cal-session-row:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          transform: translateY(-1px);
        }

        /* ── Mobile tweaks ── */
        @media (max-width: 640px) {
          .dashboard-disputes-btn { display: none; }
          .dashboard-disputes-mobile { display: flex !important; }
          .recent-session-row { padding-left: var(--space-2) !important; padding-right: var(--space-2) !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cal-session-row { transition: none !important; }
        }
      `}</style>
    </>
  );
}
