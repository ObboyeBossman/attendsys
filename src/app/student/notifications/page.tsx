import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/student/NotificationsList";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, type, is_read, created_at, session_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">


      <NotificationsList initialNotifications={(notifications ?? []) as any} />
    </div>
  );
}
