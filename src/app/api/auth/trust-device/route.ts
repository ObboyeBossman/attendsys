import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/trust-device
 *
 * SFR-AUTH-10 — "Remember this device"
 *
 * Called after a successful login when "Keep me signed in" is checked.
 * Sets a long-lived HttpOnly device trust cookie (`atsd_device`) containing
 * a minimal JSON payload (base64) with the user's email and display name.
 *
 * The cookie is used server-side (page.tsx) to:
 *   1. Pre-fill the email field on the login form for returning users.
 *   2. Show a "Welcome back" personalised hint.
 *
 * It is NOT used for authentication — only for UX personalisation.
 * The actual auth session is always verified via Supabase.
 *
 * Body: { name: string; email: string }
 */
export async function POST(request: NextRequest) {
  // Verify there is an active session before setting a device trust cookie
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let displayName = "";
  let email = user.email ?? "";

  try {
    const body = await request.json();
    if (typeof body?.name === "string") displayName = body.name.trim();
    if (typeof body?.email === "string") email = body.email.trim();
  } catch {
    // body parse failed — use user email from session
  }

  // Encode device trust payload as base64 JSON
  const payload = Buffer.from(
    JSON.stringify({ email, name: displayName, uid: user.id })
  ).toString("base64");

  const ONE_YEAR = 60 * 60 * 24 * 365;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("atsd_device", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  return response;
}

/**
 * DELETE /api/auth/trust-device
 *
 * Removes the device trust cookie (e.g., when user explicitly signs out
 * and wants to clear remembered device).
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("atsd_device", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
