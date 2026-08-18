import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LecturerDashboardClient } from "./LecturerDashboardClient";
import type { DashboardData } from "./LecturerDashboardClient";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 30;

/* ── helpers ────────────────────────────────────────────────────────────── */
function attendanceRate(present: number, total: number) {
  if (total === 0) return "—";
  return `${Math.round((present / total) * 100)}%`;
}

/* ── types ───────────────────────────────────────────────────────────────── */
type LiveSessionRow = {
  id: string;
  started_at: string;
  venue: string | null;
  courses: { id: string; name: string; code: string; group_id: string } | null;
};

type RecentSessionRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  venue: string | null;
  courses: { name: string; code: string } | null;
  attendance: { id: string; status: string }[];
};

type CourseRow = {
  id: string;
  name: string;
  code: string;
  group_id: string;
};

/* ── data fetching ───────────────────────────────────────────────────────── */
async function getLecturerDashboard(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify lecturer identity
  const lecturerResult = await supabase
    .from("lecturers")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();
  const lecturer = lecturerResult.data as { id: string; name: string } | null;
  if (!lecturer) redirect("/login");

  // Active semester
  const semResult = await supabase
    .from("app_semesters")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle();
  const sem = semResult.data as { id: string; name: string } | null;

  // Courses assigned to this lecturer this semester
  const coursesResult = sem
    ? await supabase
        .from("courses")
        .select("id, name, code, group_id")
        .eq("lecturer_id", user.id)
        .eq("semester_id", sem.id)
    : { data: [] };
  const courses = (coursesResult.data ?? []) as CourseRow[];
  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return {
      lecturerName: lecturer.name,
      semesterName: sem?.name ?? null,
      totalCourses: 0,
      totalSessions: 0,
      totalStudents: 0,
      overallRate: "—",
      pendingDisputes: 0,
      liveSession: null,
      liveCheckins: 0,
      liveTotal: 0,
      recentSessions: [],
    };
  }

  // Parallel fetches
  const [sessionsRes, disputesRes, liveSessionRes, recentSessionsRes] =
    await Promise.all([
      supabase
        .from("class_sessions")
        .select("id", { count: "exact", head: true })
        .in("course_id", courseIds)
        .not("ended_at", "is", null),

      supabase
        .from("attendance_disputes")
        .select("id, attendance!inner(class_sessions!inner(course_id))", {
          count: "exact",
          head: true,
        })
        .eq("status", "pending")
        .in("attendance.class_sessions.course_id", courseIds),

      supabase
        .from("class_sessions")
        .select("id, started_at, venue, courses(id, name, code, group_id)")
        .in("course_id", courseIds)
        .is("ended_at", null)
        .limit(1)
        .maybeSingle(),

      // Fetch more sessions for the calendar view (30 instead of 5)
      supabase
        .from("class_sessions")
        .select(
          "id, started_at, ended_at, venue, courses(name, code), attendance(id, status)"
        )
        .in("course_id", courseIds)
        .not("ended_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(30),
    ]);

  const totalSessions = sessionsRes.count ?? 0;
  const pendingDisputes = disputesRes.count ?? 0;
  const liveSession =
    (liveSessionRes.data as unknown as LiveSessionRow) ?? null;

  // Student count
  const groupIds = [...new Set(courses.map((c) => c.group_id))];
  const studentsRes = groupIds.length
    ? await supabase
        .from("group_memberships")
        .select("student_id", { count: "exact", head: true })
        .in("group_id", groupIds)
        .eq("status", "active")
    : { count: 0 };
  const totalStudents = studentsRes.count ?? 0;

  // Live session checkin count
  let liveCheckins = 0;
  let liveTotal = 0;
  if (liveSession?.id) {
    const [checkinsRes, liveCourseStudentsRes] = await Promise.all([
      supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("session_id", liveSession.id)
        .in("status", ["present", "late"]),
      liveSession.courses?.group_id
        ? supabase
            .from("group_memberships")
            .select("student_id", { count: "exact", head: true })
            .eq("group_id", liveSession.courses.group_id)
            .eq("status", "active")
        : Promise.resolve({ count: 0 }),
    ]);
    liveCheckins = checkinsRes.count ?? 0;
    liveTotal = liveCourseStudentsRes.count ?? 0;
  }

  // Overall attendance rate
  let overallRate = "—";
  const attResult = await supabase
    .from("attendance")
    .select("status, class_sessions!inner(course_id)")
    .in("class_sessions.course_id", courseIds);
  const attData = (attResult.data ?? []) as { status: string }[];
  if (attData.length > 0) {
    const present = attData.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    overallRate = attendanceRate(present, attData.length);
  }

  // Shape recent sessions
  const recentSessions = (
    (recentSessionsRes.data ?? []) as unknown as RecentSessionRow[]
  ).map((s) => {
    const att = s.attendance ?? [];
    const checkedIn = att.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    const absentCount = att.filter((a) => a.status === "absent").length;
    return {
      id: s.id,
      started_at: s.started_at,
      courseName: s.courses?.name ?? "Unknown",
      courseCode: s.courses?.code ?? "",
      checkedIn,
      rate: attendanceRate(checkedIn, checkedIn + absentCount),
    };
  });

  return {
    lecturerName: lecturer.name,
    semesterName: sem?.name ?? null,
    totalCourses: courses.length,
    totalSessions,
    totalStudents,
    overallRate,
    pendingDisputes,
    liveSession,
    liveCheckins,
    liveTotal,
    recentSessions,
  };
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default async function LecturerDashboard() {
  const data = await getLecturerDashboard();
  return <LecturerDashboardClient data={data} />;
}
