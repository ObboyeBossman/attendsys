"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FullscreenLoader } from "@/components/layout";
import { Input, Button, Toast } from "@/components/ui";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import {
  getRemainingCooldown,
  recordFailedAttempt,
  clearAttempts,
  getAttemptCount,
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

  // ── Rate limiting state ──────────────────────────────────
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldownTimer = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Restore cooldown on mount (e.g. page refresh mid-cooldown)
  useEffect(() => {
    if (!email) return;
    const remaining = getRemainingCooldown(email);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (remaining > 0) startCooldownTimer(remaining);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Also restore whenever email changes (user types a different address)
  useEffect(() => {
    if (!email) return;
    const remaining = getRemainingCooldown(email);
    if (remaining > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCooldownTimer(remaining);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldown(0);
    }
  }, [email, startCooldownTimer]);

  // Auto-dismiss error toast after 5 s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    // Block if still cooling down
    if (cooldown > 0) return;

    setError(null);
    setLoading(true);
    setAuthStage("Checking credentials…");

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (signInError) {
        // Record the failure and apply cooldown
        const newCooldown = recordFailedAttempt(email);
        const count = getAttemptCount(email);

        // Build error message with attempt context after 2+ failures
        let msg = formatAuthErrorMessage(signInError);
        if (count >= 3 && newCooldown > 0) {
          msg = `${msg} Please wait ${newCooldown}s before trying again.`;
        } else if (count === 2) {
          msg = `${msg} One more failed attempt will trigger a cooldown.`;
        }

        setError(msg);
        if (newCooldown > 0) startCooldownTimer(newCooldown);
        setLoading(false);
        return;
      }

      const user = signInData?.user;
      if (!user) {
        const newCooldown = recordFailedAttempt(email);
        setError("Authentication failed. Please try again.");
        if (newCooldown > 0) startCooldownTimer(newCooldown);
        setLoading(false);
        return;
      }

      // Success — clear attempt counter
      clearAttempts(email);

      // Stage 2: Sync session server-side
      setAuthStage("Verifying account permissions…");

      let profile: {
        role: string;
        is_active: boolean;
        must_change_password: boolean;
      } | null = null;

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
          if (data?.profile) profile = data.profile;
        }
      } catch (err) {
        console.error("set-session error:", err);
      }

      // Fallback: fetch profile client-side
      if (!profile) {
        const { data: clientProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, is_active, must_change_password")
          .eq("id", user.id)
          .single();

        if (profileError || !clientProfile) {
          setError("Could not load account details. Contact support.");
          setLoading(false);
          return;
        }
        profile = clientProfile as {
          role: string;
          is_active: boolean;
          must_change_password: boolean;
        };
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

      let dest =
        portalMap[p.role] ?? {
          label: "Student Portal",
          path: "/student/dashboard",
        };

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

      window.location.href = destination;
    } catch (err: any) {
      const newCooldown = recordFailedAttempt(email);
      setError(formatAuthErrorMessage(err));
      if (newCooldown > 0) startCooldownTimer(newCooldown);
      setLoading(false);
    }
  };

  const isBlocked = cooldown > 0;
  const attemptCount = email ? getAttemptCount(email) : 0;

  return (
    <>
      <FullscreenLoader visible={loading} message={authStage} />

      {error && !loading && (
        <Toast
          message={error}
          variant="error"
          onDismiss={() => setError(null)}
        />
      )}

      <form
        onSubmit={handlePasswordLogin}
        className={`${styles.fadeIn} ${styles.formBody}`}
      >
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
          disabled={loading || isBlocked}
        />

        {/* ── Cooldown banner ── */}
        {isBlocked && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "10px 14px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border-hover)",
            }}
          >
            {/* Animated countdown ring */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{ flexShrink: 0 }}
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="var(--color-surface-3)"
                strokeWidth="2"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 8}`}
                strokeDashoffset={`${2 * Math.PI * 8 * (cooldown / (attemptCount <= 3 ? 15 : attemptCount === 4 ? 30 : 60))}`}
                transform="rotate(-90 10 10)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Too many failed attempts
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                  margin: 0,
                  marginTop: 2,
                }}
              >
                Try again in{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {cooldown}s
                </span>
              </p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!email || !password || isBlocked}
          style={{ width: "100%", marginTop: 8 }}
        >
          {loading ? "SIGNING IN…" : isBlocked ? `WAIT ${cooldown}s` : "SIGN IN"}
        </Button>

        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={
              onForgotPassword ||
              (() =>
                alert(
                  "To reset your password, contact your department administrator or the ICT Helpdesk."
                ))
            }
            style={{
              color: "var(--color-text-3)",
              fontSize: "var(--text-xs)",
            }}
          >
            Forgot password?
          </Button>
        </div>

        <div className={styles.backBtnRow}>
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onBack}
            style={{
              color: "var(--color-text-2)",
              fontSize: "var(--text-sm)",
            }}
          >
            ← Back to options
          </Button>
        </div>
      </form>
    </>
  );
}
