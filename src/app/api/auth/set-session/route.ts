import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/set-session
 *
 * SFR-AUTH-09 — "Keep session active"
 *
 * Called immediately after a successful client-side signInWithPassword().
 * Establishes server-side HttpOnly session cookies and returns user profile.
 *
 * Body: { access_token?: string, refresh_token?: string, userId?: string, persist?: boolean }
 */
export async function POST(request: NextRequest) {
  let persist = true;
  let accessToken = "";
  let refreshToken = "";
  let targetUserId = "";

  try {
    const body = await request.json();
    if (typeof body?.persist === "boolean") persist = body.persist;
    if (typeof body?.access_token === "string") accessToken = body.access_token;
    if (typeof body?.refresh_token === "string") refreshToken = body.refresh_token;
    if (typeof body?.userId === "string") targetUserId = body.userId;
  } catch {
    // malformed body — fall back to defaults
  }

  const supabase = await createSupabaseServerClient();

  // If tokens were explicitly passed in request body, set session on server client
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // Get active session
  let {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = targetUserId || session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  // Fetch profile via admin client to ensure 100% reliable read regardless of RLS timing
  let profile = null;
  try {
    const adminSupabase = await createSupabaseAdminClient();
    const { data: p } = await adminSupabase
      .from("user_profiles")
      .select("role, is_active, must_change_password")
      .eq("id", userId)
      .single();
    profile = p;
  } catch (err) {
    console.error("Admin profile fetch error:", err);
  }

  // Fallback to server client if admin client wasn't available
  if (!profile && session) {
    const { data: p } = await supabase
      .from("user_profiles")
      .select("role, is_active, must_change_password")
      .eq("id", session.user.id)
      .single();
    profile = p;
  }

  const response = NextResponse.json({ ok: true, profile });

  // Re-set all sb-* cookies with the desired maxAge (HttpOnly + Secure + Lax)
  const THIRTY_DAYS = 60 * 60 * 24 * 30; // seconds

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(persist ? { maxAge: THIRTY_DAYS } : {}),
  };

  const incomingCookies = request.cookies.getAll();
  for (const { name, value } of incomingCookies) {
    if (name.startsWith("sb-") || name.includes("supabase")) {
      response.cookies.set(name, value, cookieOptions);
    }
  }

  return response;
}
