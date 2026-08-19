"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitAttendance({
  sessionId,
  studentId,
  status,
  selfiePath,
  deviceToken,
  geoVerified,
}: {
  sessionId: string;
  studentId: string;
  status: "present" | "late";
  selfiePath: string;
  deviceToken: string;
  geoVerified: boolean;
}) {
  const supabase = await createSupabaseServerClient();

  // Validate caller authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== studentId) {
    return { error: "Unauthorized" };
  }

  // Server-side enforcement (SFR-AUTH-19): One device per check-in per session
  if (deviceToken) {
    const { data: existingDeviceCheckin } = await supabase
      .from("attendance")
      .select("student_id")
      .eq("session_id", sessionId)
      .eq("device_token", deviceToken)
      .neq("student_id", studentId)
      .limit(1)
      .maybeSingle();

    if (existingDeviceCheckin) {
      return {
        error: "This device has already been used to check in another student for this session.",
      };
    }
  }

  try {
    const payload: any = {
      session_id: sessionId,
      student_id: studentId,
      status,
      selfie_path: selfiePath,
      device_token: deviceToken,
      geo_verified: geoVerified,
      checked_in_at: new Date().toISOString(),
      latitude: null,
      longitude: null,
      gps_accuracy: null,
    };

    const { error } = await supabase.from("attendance").insert(payload);

    if (error) {
      if (error.code === '23505') { // unique_violation
        return { error: "You have already checked into this session." };
      }
      console.error("Attendance insert error:", error);
      return { error: "Failed to record attendance. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("Attendance insert exception:", err);
    return { error: "An unexpected error occurred." };
  }
}
