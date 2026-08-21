import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 30; // refresh data every 30 s on ISR

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

async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  // Threshold: 4 hours ago in ISO format — for long-running session alerts
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  // Today's date string for stale semester detection
  const today = new Date().toISOString().slice(0, 10);

  const [
    semesterRes,
    studentsRes,
    lecturersRes,
    sessionsRes,
    disputesRes,
    liveSessionsRes,
    auditRes,
    longSessionsRes,
    staleSemestersRes,
  ] = await Promise.all([
    // Active semester
    supabase
      .from("app_semesters")
      .select("id, name, academic_year_id, academic_years(name)")
      .eq("status", "active")
      .maybeSingle(),

    // Active students
    supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),

    // Active lecturers
    supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "lecturer")
      .eq("is_active", true),

    // Sessions started today (UTC midnight → now)
    supabase
      .from("class_sessions")
      .select("id", { count: "exact", head: true })
      .gte("started_at", new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()),

    // Pending disputes
    supabase
      .from("attendance_disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    // Live (open) sessions with course + group info
    supabase
      .from("class_sessions")
      .select(`
        id,
        started_at,
        venue,
        courses (
          name,
          code,
          groups ( group_name )
        )
      `)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(10),

    // Recent audit events
    supabase
      .from("audit_log")
      .select("id, action, table_name, created_at, actor_id")
      .order("created_at", { ascending: false })
      .limit(8),

    // Alert: sessions still open after 4 hours
    supabase
      .from("class_sessions")
      .select("id, started_at, courses(name, code)")
      .is("ended_at", null)
      .lte("started_at", fourHoursAgo)
      .limit(5),

    // Alert: semesters whose start_date has passed but status is still 'inactive'
    supabase
      .from("app_semesters")
      .select("id, name, start_date")
      .eq("status", "inactive")
      .lte("start_date", today)
      .limit(5),
  ]);

  // Derive active semester label
  let semesterLabel = "None";
  if (semesterRes.data) {
    const s = semesterRes.data as {
      name: string;
      academic_years: { name: string } | null;
    };
    semesterLabel = s.academic_years
      ? `${s.name} — ${s.academic_years.name}`
      : s.name;
  }

  return {
    semesterLabel,
    activeStudents: studentsRes.count ?? 0,
    activeLecturers: lecturersRes.count ?? 0,
    sessionsToday: sessionsRes.count ?? 0,
    pendingDisputes: disputesRes.count ?? 0,
    liveSessions: (liveSessionsRes.data ?? []) as LiveSession[],
    auditEvents: (auditRes.data ?? []) as AuditEvent[],
    longRunningSessions: (longSessionsRes.data ?? []) as LiveSession[],
    staleSemesters: (staleSemestersRes.data ?? []) as StaleSemester[],
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  return <AdminDashboardClient data={data} />;
}
