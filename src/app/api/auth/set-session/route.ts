import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/set-session
 *
 * SFR-AUTH-09 — "Keep session active"
 *
 * Called immediately after a successful client-side signInWithPassword().
 * Re-writes all sb-* session cookies with the appropriate maxAge:
 *   persist=true  → maxAge 30 days  (survives browser restarts)
 *   persist=false → no maxAge       (session cookie — cleared on browser close)
 *
 * Body: { persist: boolean }
 */
export async function POST(request: NextRequest) {
  let persist = true; // default: keep session active

  try {
    const body = await request.json();
    if (typeof body?.persist === "boolean") {
      persist = body.persist;
    }
  } catch {
    // malformed body — fall back to default
  }

  // Read the current session via the server client (which reads from cookies)
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  // Re-set all sb-* cookies with the desired maxAge.
  // The browser client sets them as non-httpOnly on sign-in;
  // we upgrade them here to httpOnly + correct maxAge.
  const THIRTY_DAYS = 60 * 60 * 24 * 30; // seconds

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(persist ? { maxAge: THIRTY_DAYS } : {}),
    // When persist=false, omitting maxAge makes this a session cookie
    // (cleared when the browser is fully closed).
  };

  // Re-set each sb-* cookie from the incoming request
  const incomingCookies = request.cookies.getAll();
  for (const { name, value } of incomingCookies) {
    if (name.startsWith("sb-") || name.includes("supabase")) {
      response.cookies.set(name, value, cookieOptions);
    }
  }

  return response;
}
