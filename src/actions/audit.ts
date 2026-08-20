"use server";

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export type LoginAttemptItem = {
  id: number;
  action: "user.login" | "user.login_failed" | "user.account_locked" | "user.password_changed" | string;
  createdAt: string;
  newData?: Record<string, unknown> | null;
};

/**
 * SFR-AUTH-18 — Login attempt history for admins
 *
 * Fetches recent login attempt logs for a specific target user ID.
 * Returns up to 50 entries sorted newest first.
 */
export async function getUserLoginHistory(
  targetUserId: string
): Promise<{ error: string } | { logs: LoginAttemptItem[] }> {
  if (!targetUserId) return { error: "User ID required." };

  const supabase = await createSupabaseServerClient();

  // Auth guard: caller must be an active super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized." };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const p = profile as { role: string; is_active: boolean } | null;
  if (!p || p.role !== "super_admin" || !p.is_active) {
    return { error: "Unauthorized." };
  }

  // Admin client bypasses RLS on audit_log
  const adminClient = await createSupabaseAdminClient();

  const { data, error } = await (adminClient as any)
    .from("audit_log")
    .select("id, action, new_data, created_at")
    .or(`actor_id.eq.${targetUserId},record_id.eq.${targetUserId}`)
    .in("action", [
      "user.login",
      "user.login_failed",
      "user.account_locked",
      "user.password_changed",
      "user.logout",
    ])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getUserLoginHistory error:", error);
    return { error: "Failed to fetch login history." };
  }

  const logs: LoginAttemptItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    action: row.action,
    createdAt: row.created_at,
    newData: row.new_data ?? null,
  }));

  return { logs };
}
