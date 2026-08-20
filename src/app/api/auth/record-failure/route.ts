import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/record-failure
 *
 * SFR-AUTH-07 — Temporary account lock after failed attempts.
 *
 * Called from EmailLoginForm on every failed signInWithPassword().
 * Uses the service-role admin client because the user is not authenticated
 * at this point — we look up the profile by email directly in user_profiles.
 *
 * Lock policy:
 *   Threshold : LOCK_THRESHOLD failed attempts (10)
 *   Duration  : LOCK_DURATION_MINUTES minutes (30)
 *   Reset     : cleared automatically by /api/auth/set-session on successful login
 *               or manually by a super_admin via the admin UI
 *
 * Body: { email: string }
 *
 * Response:
 *   { locked: false, attempts: number }       — still within threshold
 *   { locked: true,  lockedUntil: string }    — account just locked / already locked
 *   { locked: false, notFound: true }         — email not found (silent; avoids enumeration)
 */

const LOCK_THRESHOLD = 10;        // consecutive failures before lock
const LOCK_DURATION_MINUTES = 30; // how long the lock lasts

export async function POST(request: NextRequest) {
  let email = "";
  try {
    const body = await request.json();
    if (typeof body?.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const adminClient = await createSupabaseAdminClient();

    // Look up the profile directly by email — avoids the unavailable getUserByEmail admin method
    // and is a single round-trip. Fail silently if email not found (avoid enumeration).
    const { data: profile, error: fetchError } = await adminClient
      .from("user_profiles")
      .select("id, failed_login_count, locked_until")
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      // Email not in the system — respond silently to avoid email enumeration
      return NextResponse.json({ locked: false, notFound: true });
    }

    const p = profile as {
      id: string;
      failed_login_count: number;
      locked_until: string | null;
    };

    // If already locked and lock is still active, short-circuit
    if (p.locked_until && new Date(p.locked_until) > new Date()) {
      return NextResponse.json({ locked: true, lockedUntil: p.locked_until });
    }

    const newCount = (p.failed_login_count ?? 0) + 1;

    if (newCount >= LOCK_THRESHOLD) {
      // Threshold reached — lock the account
      const lockedUntil = new Date(
        Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
      ).toISOString();

      // Cast required: generated types predate the 0009 migration columns (matches pattern in student actions.ts)
      const { error: lockError } = await (adminClient as any)
        .from("user_profiles")
        .update({ failed_login_count: newCount, locked_until: lockedUntil })
        .eq("id", p.id);

      if (lockError) {
        console.error("record-failure: lock update error:", lockError);
        // Still return locked: false so the UI doesn't falsely report a lock
        return NextResponse.json({ locked: false, attempts: newCount });
      }

      // Record account lockout in audit_log (SFR-AUTH-18)
      (adminClient as any)
        .from("audit_log")
        .insert({
          actor_id: p.id,
          action: "user.account_locked",
          table_name: "user_profiles",
          record_id: p.id,
          new_data: { failed_attempts: newCount, locked_until: lockedUntil },
        })
        .then(({ error }: { error: unknown }) => {
          if (error) console.error("record-failure: audit_log lockout error:", error);
        });

      return NextResponse.json({ locked: true, lockedUntil });
    }

    // Below threshold — increment only; same cast reason as above
    const { error: updateError } = await (adminClient as any)
      .from("user_profiles")
      .update({ failed_login_count: newCount })
      .eq("id", p.id);

    if (updateError) {
      console.error("record-failure: increment error:", updateError);
    }

    // Record login failure in audit_log (SFR-AUTH-18)
    (adminClient as any)
      .from("audit_log")
      .insert({
        actor_id: p.id,
        action: "user.login_failed",
        table_name: "user_profiles",
        record_id: p.id,
        new_data: { failed_attempts: newCount },
      })
      .then(({ error }: { error: unknown }) => {
        if (error) console.error("record-failure: audit_log failure error:", error);
      });

    return NextResponse.json({ locked: false, attempts: newCount });
  } catch (err) {
    console.error("record-failure: unexpected error:", err);
    // Fail open — don't block login on infra errors
    return NextResponse.json({ locked: false });
  }
}
