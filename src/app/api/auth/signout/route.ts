import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/signout
 *
 * Server-side sign-out handler. Required because SFR-AUTH-03 sets session
 * cookies as HttpOnly — they cannot be cleared by client-side JavaScript.
 * This route signs out via the server Supabase client (which CAN write/clear
 * HttpOnly cookies) and then hard-redirects to /login.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Sign out on the server — this clears the HttpOnly session cookie
  await supabase.auth.signOut();

  const loginUrl = new URL("/login", request.url);

  const response = NextResponse.redirect(loginUrl, { status: 302 });

  // Belt-and-suspenders: explicitly delete all known Supabase auth cookie names
  // These match the chunked cookie names used by @supabase/ssr
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  for (const name of cookieNames) {
    if (name.startsWith("sb-") || name.includes("supabase")) {
      response.cookies.set(name, "", {
        maxAge: 0,
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  return response;
}
