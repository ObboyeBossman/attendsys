"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };
  return {};
}

/**
 * SFR-AUTH-15 — Password-change notification
 *
 * Reads the `password_reset_by_admin_at` flag from the caller's profile,
 * clears it atomically, and returns the timestamp so the client can show
 * a one-time security notice.
 */
export async function checkAndClearPasswordResetNotification(): Promise<{
  resetAt: string | null;
}> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { resetAt: null };

  const { data } = await (supabase as any)
    .from("user_profiles")
    .select("password_reset_by_admin_at")
    .eq("id", user.id)
    .single();

  const resetAt: string | null =
    (data as any)?.password_reset_by_admin_at ?? null;

  if (resetAt) {
    // Clear the flag — the user will now see the notice and it won't repeat
    await (supabase as any)
      .from("user_profiles")
      .update({ password_reset_by_admin_at: null })
      .eq("id", user.id);
  }

  return { resetAt };
}
