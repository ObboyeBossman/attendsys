"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FullscreenLoader } from "@/components/layout";
import { Input, Button, Toast } from "@/components/ui";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import {
  getRemainingCooldown,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/login-rate-limit";
import styles from "../LoginClient.module.css";

interface EmailLoginFormProps {
  onBack: () => void;
  onForgotPassword?: () => void;
  rememberedEmail?: string;
  rememberedName?: string;
}

export function EmailLoginForm({
  onBack,
  onForgotPassword,
  rememberedEmail = "",
  rememberedName = "",
}: EmailLoginFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authStage, setAuthStage] = useState<string>("Checking credentials…");
  const [error, setError] = useState<string | null>(null);
  // SFR-AUTH-07: server-side account lock expiry
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  // SFR-AUTH-06: client-side progressive cooldown
  const [cooldown, setCooldown] = useState<number>(0); // seconds remaining
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // Auto-clear client-side lock once the lock expiry time passes (SFR-AUTH-07)
  useEffect(() => {
    if (!lockedUntil) return;
    const remaining = lockedUntil.getTime() - Date.now();
    if (remaining <= 0) { setLockedUntil(null); return; }
    const timer = setTimeout(() => setLockedUntil(null), remaining);
    return () => clearTimeout(timer);
  }, [lockedUntil]);

  // Hydrate cooldown from sessionStorage on mount (SFR-AUTH-06)
  useEffect(() => {
    if (!email) return;
    const remaining = getRemainingCooldown(email);
    if (remaining > 0) startTicker(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check cooldown whenever email changes (SFR-AUTH-06)
  useEffect(() => {
    if (!email) return;
    const remaining = getRemainingCooldown(email);
    if (remaining > 0) {
      startTicker(remaining);
    } else {
      stopTicker();
      setCooldown(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  function startTicker(initialSeconds: number) {
    stopTicker();
    setCooldown(initialSeconds);
    tickerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          stopTicker();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTicker() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }

  // Cleanup ticker on unmount
  useEffect(() => () => stopTicker(), []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    // SFR-AUTH-07: block if account is server-side locked
    if (lockedUntil && lockedUntil > new Date()) {
      const until = lockedUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setError(`Account locked. Try again after ${until}.`);
      return;
    }

    // SFR-AUTH-06: block submission during active client-side cooldown
    const remaining = getRemainingCooldown(email);
    if (remaining > 0) {
      startTicker(remaining);
      setError(`Too many failed attempts. Please wait ${remaining}s before trying again.`);
      return;
    }

    setError(null);
    setLoading(true);
    setAuthStage("Checking credentials…");

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        // SFR-AUTH-06: record client-side failure, start cooldown if threshold crossed
        const cooldownSecs = recordFailedAttempt(email);

        // SFR-AUTH-07: record failure server-side; check if account is now locked
        try {
          const failRes = await fetch("/api/auth/record-failure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
          });
          if (failRes.ok) {
            const failData = await failRes.json();
            if (failData?.locked) {
              const lockDate = failData.lockedUntil ? new Date(failData.lockedUntil) : null;
              if (lockDate) setLockedUntil(lockDate);
              const until = lockDate
                ? lockDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";
              setError(
                `Account temporarily locked due to too many failed attempts.${until ? ` Try again after ${until}.` : " Please wait 30 minutes or contact an admin."}`
              );
              setLoading(false);
              return;
            }
          }
        } catch (failErr) {
          // Non-fatal — proceed to show the normal error
          console.error("record-failure call failed:", failErr);
        }

        setError(formatAuthErrorMessage(signInError));
        setLoading(false);
        if (cooldownSecs > 0) startTicker(cooldownSecs);
        return;
      }

      const user = signInData?.user;
      if (!user) {
        const cooldownSecs = recordFailedAttempt(email);
        setError("Authentication failed. Please try again.");
        setLoading(false);
        if (cooldownSecs > 0) startTicker(cooldownSecs);
        return;
      }

      // SFR-AUTH-06: successful sign-in — clear attempt counter
      clearAttempts(email);

      // Stage 2: Credentials verified, sync session & verify account permissions server-side
      setAuthStage("Verifying account permissions…");

      let profile: { role: string; is_active: boolean; must_change_password: boolean } | null = null;

      try {
        const res = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: signInData.session?.access_token || "",
            refresh_token: signInData.session?.refresh_token || "",
            userId: user.id,
            persist: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            profile = data.profile;
          }
        }
      } catch (err) {
        console.error("set-session error:", err);
      }

      // Fallback: fetch user profile client-side if server response didn't contain profile
      if (!profile) {
        const { data: clientProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, is_active, must_change_password")
          .eq("id", user.id)
          .single();

        if (profileError || !clientProfile) {
          console.error("Profile fetch error:", profileError);
          setError("Could not load account details. Contact support.");
          setLoading(false);
          return;
        }
        profile = clientProfile as { role: string; is_active: boolean; must_change_password: boolean };
      }

      const p = profile;

      if (!p.is_active) {
        await supabase.auth.signOut();
        setError("Your account has been deactivated. Contact admin.");
        setLoading(false);
        return;
      }

      // Stage 3: Resolve portal destination
      const portalMap: Record<string, { label: string; path: string }> = {
        super_admin: { label: "Admin Portal", path: "/admin/dashboard" },
        lecturer: { label: "Lecturer Portal", path: "/lecturer/dashboard" },
        student: { label: "Student Portal", path: "/student/dashboard" },
      };

      let dest = portalMap[p.role] ?? { label: "Student Portal", path: "/student/dashboard" };

      if (p.role === "student") {
        const { data: repMembership } = await supabase
          .from("group_memberships")
          .select("id")
          .eq("student_id", user.id)
          .eq("is_course_rep", true)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (repMembership) {
          dest = { label: "Course Rep Portal", path: "/rep/dashboard" };
        }
      }

      setAuthStage(`Connecting to ${dest.label}…`);

      let destination = dest.path;

      if (p.must_change_password) {
        const encodedNext = encodeURIComponent(destination);
        destination = `/change-password?next=${encodedNext}`;
        setAuthStage("Redirecting to password setup…");
      } else {
        setAuthStage(`Opening ${dest.label} dashboard…`);
      }

      // Perform clean location navigation to flush all server components and middleware state
      window.location.href = destination;
    } catch (err: any) {
      setError(formatAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const isCoolingDown = cooldown > 0;
  const isLocked = !!(lockedUntil && lockedUntil > new Date());

  return (
    <>
      {/* Global Stage-Aware Fullscreen Loader */}
      <FullscreenLoader visible={loading} message={authStage} />

      {/* Floating Custom Toast Banner */}
      {error && !loading && (
        <Toast
          message={error}
          variant="error"
          onDismiss={() => setError(null)}
        />
      )}

      <form onSubmit={handlePasswordLogin} className={`${styles.fadeIn} ${styles.formBody}`}>
        {/* Global Input Component for Email */}
        <Input
          label="Email"
          type="email"
          required
          placeholder="name@ttu.edu.gh"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          disabled={loading}
        />

        {/* Global Input Component for Password (includes built-in eye toggle) */}
        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          disabled={loading || isCoolingDown || isLocked}
        />

        {/* SFR-AUTH-06: Cooldown countdown banner */}
        {isCoolingDown && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-warning, #f59e0b)",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Too many failed attempts — try again in{" "}
            <strong>{cooldown}s</strong>
          </p>
        )}

        {/* Global Button Component for Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!email || !password || isCoolingDown || isLocked}
          style={{ width: "100%", marginTop: 8 }}
        >
          {loading
            ? "SIGNING IN…"
            : isCoolingDown
            ? `WAIT ${cooldown}s…`
            : isLocked
            ? "ACCOUNT LOCKED"
            : "SIGN IN"}
        </Button>

        {/* Forgot password link */}
        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onForgotPassword || (() => alert("To reset your password, contact your department administrator or the ICT Helpdesk."))}
            style={{ color: "var(--color-text-3)", fontSize: "var(--text-xs)" }}
          >
            Forgot password?
          </Button>
        </div>

        {/* Back button to return to options */}
        <div className={styles.backBtnRow}>
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onBack}
            style={{ color: "var(--color-text-2)", fontSize: "var(--text-sm)" }}
          >
            ← Back to options
          </Button>
        </div>
      </form>
    </>
  );
}
