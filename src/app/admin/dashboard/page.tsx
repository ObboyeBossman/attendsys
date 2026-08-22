import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 30; // refresh data every 30 s on ISR

/* ── Types ──────────────────────────────────────────────────────────────── */

export type LiveSession = {
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

export type AuditEvent = {
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

/* ── Raw query shapes (cast via as unknown as T) ─────────────────────────── */

type RawLiveSession = {
  id: string;
  started_at: string;
  venue: string | null;
  created_by: string | null;
  courses: {
    name: string;
    code: string;
    group_id: string;
    lecturer_id: string | null;
    groups: { group_name: string } | null;
  } | null;
};

type RawLongSession = {
  id: string;
  started_at: string;
  courses: { name: string; code: string } | null;
};

export type DisputeItem = {
  id: string;
  reason: string;
  raised_at: string;
  studentName: string;
  indexNumber: string;
  courseName: string;
  courseCode: string;
  sessionDate: string;
  currentStatus: "present" | "late" | "absent" | null;
};

/* ── Data fetching ────────────────────────────────────────────────────────── */

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

    // Live (open) sessions with course + group info + created_by for opened_by resolution
    supabase
      .from("class_sessions")
      .select(`
        id,
        started_at,
        venue,
        created_by,
        courses (
          name,
          code,
          group_id,
          lecturer_id,
          groups ( group_name )
        )
      `)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(10),

    // Recent audit events — actor_id resolved in a follow-up query below
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

  /* ── Pending disputes list ───────────────────────────────────────────────── */
  type RawDispute = { id: string; attendance_id: string; reason: string; raised_at: string };
  const { data: rawDisputes } = await supabase
    .from("attendance_disputes")
    .select("id, attendance_id, reason, raised_at")
    .eq("status", "pending")
    .order("raised_at", { ascending: false })
    .limit(20);

  const pendingDisputesList: DisputeItem[] = [];

  if (rawDisputes && (rawDisputes as RawDispute[]).length > 0) {
    const dRows = rawDisputes as RawDispute[];
    const attIds = dRows.map((d) => d.attendance_id);

    type AttRow = { id: string; student_id: string; status: "present" | "late" | "absent"; session_id: string };
    const { data: attRows } = await supabase
      .from("attendance")
      .select("id, student_id, status, session_id")
      .in("id", attIds);

    const attMap: Record<string, AttRow> = {};
    for (const a of (attRows ?? []) as AttRow[]) attMap[a.id] = a;

    const studentIds = [...new Set((attRows ?? [] as AttRow[]).map((a: AttRow) => a.student_id))];
    const sessionIdsForDisputes = [...new Set((attRows ?? [] as AttRow[]).map((a: AttRow) => a.session_id))];

    const [studentsRes2, sessionsRes2] = await Promise.all([
      studentIds.length
        ? supabase.from("students").select("id, name, index_number").in("id", studentIds)
        : Promise.resolve({ data: [] }),
      sessionIdsForDisputes.length
        ? supabase.from("class_sessions").select("id, started_at, courses(name, code)").in("id", sessionIdsForDisputes)
        : Promise.resolve({ data: [] }),
    ]);

    const studentMap2: Record<string, { name: string; index_number: string }> = {};
    for (const s of (studentsRes2.data ?? []) as { id: string; name: string; index_number: string }[]) {
      studentMap2[s.id] = s;
    }

    type SessionCourse = { id: string; started_at: string; courses: { name: string; code: string } | null };
    const sessionMap2: Record<string, SessionCourse> = {};
    for (const s of (sessionsRes2.data ?? []) as unknown as SessionCourse[]) {
      sessionMap2[s.id] = s;
    }

    for (const d of dRows) {
      const att = attMap[d.attendance_id];
      if (!att) continue;
      const student = studentMap2[att.student_id];
      const session = sessionMap2[att.session_id];
      pendingDisputesList.push({
        id: d.id,
        reason: d.reason,
        raised_at: d.raised_at,
        studentName: student?.name ?? "Unknown",
        indexNumber: student?.index_number ?? "—",
        courseName: session?.courses?.name ?? "Unknown Course",
        courseCode: session?.courses?.code ?? "",
        sessionDate: session?.started_at ?? d.raised_at,
        currentStatus: att.status,
      });
    }
  }

  // Cast live sessions using the established split-query / unknown-cast pattern
  const rawLiveSessions = (liveSessionsRes.data ?? []) as unknown as RawLiveSession[];

  /* ── check_in_count: count attendance rows per live session ─────────────── */
  const liveSessionIds = rawLiveSessions.map((s) => s.id);
  const checkInCountMap: Record<string, number> = {};

  if (liveSessionIds.length > 0) {
    const { data: attendanceRows } = await supabase
      .from("attendance")
      .select("session_id")
      .in("session_id", liveSessionIds);

    for (const row of (attendanceRows ?? []) as { session_id: string }[]) {
      checkInCountMap[row.session_id] = (checkInCountMap[row.session_id] ?? 0) + 1;
    }
  }

  /* ── group_size: count active group_memberships per group ───────────────── */
  const liveGroupIds = [
    ...new Set(
      rawLiveSessions
        .map((s) => s.courses?.group_id)
        .filter((id): id is string => !!id)
    ),
  ];
  const groupSizeMap: Record<string, number> = {};

  if (liveGroupIds.length > 0) {
    const { data: membershipRows } = await supabase
      .from("group_memberships")
      .select("group_id")
      .in("group_id", liveGroupIds)
      .eq("status", "active");

    for (const row of (membershipRows ?? []) as { group_id: string }[]) {
      groupSizeMap[row.group_id] = (groupSizeMap[row.group_id] ?? 0) + 1;
    }
  }

  /* ── opened_by: resolve actor name from students or lecturers table ──────
   *
   * Convention (from codebase):
   *   created_by = null  → lecturer opened (look up via courses.lecturer_id → lecturers)
   *   created_by = uuid  → rep opened (look up in students table)
   */
  const repIds = [
    ...new Set(
      rawLiveSessions
        .map((s) => s.created_by)
        .filter((id): id is string => !!id)
    ),
  ];
  const lecturerIds = [
    ...new Set(
      rawLiveSessions
        .filter((s) => s.created_by === null)
        .map((s) => s.courses?.lecturer_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const repNameMap: Record<string, string> = {};
  const lecturerNameMap: Record<string, string> = {};

  const [repNamesRes, lecturerNamesRes] = await Promise.all([
    repIds.length > 0
      ? supabase.from("students").select("id, name").in("id", repIds)
      : Promise.resolve({ data: [] }),
    lecturerIds.length > 0
      ? supabase.from("lecturers").select("id, name").in("id", lecturerIds)
      : Promise.resolve({ data: [] }),
  ]);

  for (const row of (repNamesRes.data ?? []) as { id: string; name: string }[]) {
    repNameMap[row.id] = row.name;
  }
  for (const row of (lecturerNamesRes.data ?? []) as { id: string; name: string }[]) {
    lecturerNameMap[row.id] = row.name;
  }

  /* ── Resolve audit event actor_id → actor_name ──────────────────────────
   *
   * actor_id in audit_log refers to a user profile id. The name lives in
   * students, lecturers, or super_admins tables. We resolve in order:
   * students → lecturers (super_admins have no display name table here).
   */
  const rawAuditEvents = (auditRes.data ?? []) as {
    id: number;
    action: string;
    table_name: string | null;
    created_at: string;
    actor_id: string | null;
  }[];

  const auditActorIds = [
    ...new Set(
      rawAuditEvents
        .map((e) => e.actor_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const auditActorNameMap: Record<string, string> = {};

  if (auditActorIds.length > 0) {
    const [auditStudentsRes, auditLecturersRes] = await Promise.all([
      supabase.from("students").select("id, name").in("id", auditActorIds),
      supabase.from("lecturers").select("id, name").in("id", auditActorIds),
    ]);

    for (const row of (auditStudentsRes.data ?? []) as { id: string; name: string }[]) {
      auditActorNameMap[row.id] = row.name;
    }
    for (const row of (auditLecturersRes.data ?? []) as { id: string; name: string }[]) {
      // Lecturers override students if same id appears in both (shouldn't happen)
      auditActorNameMap[row.id] = row.name;
    }
  }

  /* ── Assemble enriched live sessions ────────────────────────────────────── */
  const liveSessions: LiveSession[] = rawLiveSessions.map((s) => {
    const groupId = s.courses?.group_id ?? null;
    const lecturerId = s.courses?.lecturer_id ?? null;

    let openedByName: string | null = null;
    let openedByRole: "lecturer" | "rep" | null = null;

    if (s.created_by !== null) {
      // Rep opened
      openedByRole = "rep";
      openedByName = repNameMap[s.created_by] ?? null;
    } else if (lecturerId !== null) {
      // Lecturer opened
      openedByRole = "lecturer";
      openedByName = lecturerNameMap[lecturerId] ?? null;
    }

    return {
      id: s.id,
      started_at: s.started_at,
      venue: s.venue,
      created_by: s.created_by,
      check_in_count: checkInCountMap[s.id] ?? 0,
      group_size: groupId ? (groupSizeMap[groupId] ?? 0) : 0,
      opened_by_name: openedByName,
      opened_by_role: openedByRole,
      courses: s.courses
        ? {
            name: s.courses.name,
            code: s.courses.code,
            group_id: s.courses.group_id,
            lecturer_id: s.courses.lecturer_id,
            groups: s.courses.groups,
          }
        : null,
    };
  });

  /* ── Assemble enriched audit events ─────────────────────────────────────── */
  const auditEvents: AuditEvent[] = rawAuditEvents.map((e) => ({
    ...e,
    actor_name: e.actor_id ? (auditActorNameMap[e.actor_id] ?? null) : null,
  }));

  /* ── Derive active semester label ────────────────────────────────────────── */
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
    pendingDisputesList,
    liveSessions,
    auditEvents,
    longRunningSessions: (longSessionsRes.data ?? []) as unknown as RawLongSession[],
    staleSemesters: (staleSemestersRes.data ?? []) as StaleSemester[],
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  return <AdminDashboardClient data={data} />;
}
