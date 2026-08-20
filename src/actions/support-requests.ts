"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SupportRequestRole = "student" | "lecturer";

export type SupportRequestPayload = {
  email: string;
  role: SupportRequestRole;
  subject: string;
  message: string;
};

export type SupportRequestItem = {
  id: string;
  email: string;
  role: SupportRequestRole;
  subject: string;
  message: string;
  isReadAdmin: boolean;
  createdAt: string;
};

// ── Submit (no auth required — called from login screen) ──────────────────────

export async function submitSupportRequest(
  payload: SupportRequestPayload
): Promise<{ error: string } | { success: true }> {
  const { email, role, subject, message } = payload;

  if (!email?.trim()) return { error: "Please enter your email address." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { error: "Please enter a valid email address." };
  if (!subject?.trim()) return { error: "Please enter a subject." };
  if (!message?.trim()) return { error: "Please describe your issue." };
  if (message.trim().length < 10)
    return { error: "Please provide a bit more detail about your issue." };

  const supabase = await createSupabaseAdminClient();

  const { error: insertError } = await (supabase as any)
    .from("support_requests")
    .insert({
      email: email.trim().toLowerCase(),
      role,
      subject: subject.trim(),
      message: message.trim(),
    });

  if (insertError) {
    console.error("submitSupportRequest error:", insertError);
    return { error: "Failed to send your request. Please try again." };
  }

  return { success: true };
}

// ── Admin: fetch all ──────────────────────────────────────────────────────────

export async function getAllSupportRequests(): Promise<SupportRequestItem[]> {
  const supabase = await createSupabaseAdminClient();

  const { data } = await (supabase as any)
    .from("support_requests")
    .select("id, email, role, subject, message, is_read_admin, created_at")
    .order("created_at", { ascending: false });

  if (!data) return [];

  return (
    data as Array<{
      id: string;
      email: string;
      role: string;
      subject: string;
      message: string;
      is_read_admin: boolean;
      created_at: string;
    }>
  ).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role as SupportRequestRole,
    subject: r.subject,
    message: r.message,
    isReadAdmin: r.is_read_admin,
    createdAt: r.created_at,
  }));
}

// ── Admin: mark read ──────────────────────────────────────────────────────────

export async function markSupportRequestRead(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseAdminClient();

  const { error } = await (supabase as any)
    .from("support_requests")
    .update({ is_read_admin: true })
    .eq("id", id);

  if (error) {
    console.error("markSupportRequestRead error:", error);
    return { error: "Failed to mark as read." };
  }

  return { success: true };
}
