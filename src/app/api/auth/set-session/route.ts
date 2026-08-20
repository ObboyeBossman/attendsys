import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

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

  const cookieStore = await cookies();
  const THIRTY_DAYS = 60 * 60 * 24 * 30; // seconds

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOpts = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax" as const,
              path: "/",
              ...(persist ? { maxAge: THIRTY_DAYS } : {}),
            };
            try {
              cookieStore.set(name, value, cookieOpts);
            } catch {
              // Ignore if called from context where cookieStore cannot set
            }
            response.cookies.set(name, value, cookieOpts);
          });
        },
      },
    }
  );

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  const {
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

  const payload = { ok: true, profile };
  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: response.headers,
  });
}
