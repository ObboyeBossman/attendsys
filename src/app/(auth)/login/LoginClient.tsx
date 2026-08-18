"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./LoginClient.module.css";

type AuthView = "logout" | "email-form";

export function LoginClient() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [authView, setAuthView] = useState<AuthView>("logout");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Email & Password Authentication ─────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password. Please try again.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication failed. Please try again.");
        return;
      }

      // Fetch user profile role
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role, is_active, must_change_password")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Could not load account details. Contact support.");
        return;
      }

      const p = profile as { role: string; is_active: boolean; must_change_password: boolean };

      if (!p.is_active && p.role !== "student") {
        await supabase.auth.signOut();
        setError("Your account has been deactivated. Contact the administrator.");
        return;
      }

      const portalMap: Record<string, string> = {
        super_admin: "/admin/dashboard",
        lecturer: "/lecturer/dashboard",
        student: "/student/dashboard",
      };

      let destination = portalMap[p.role] ?? "/student/dashboard";

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
          destination = "/rep/dashboard";
        }
      }

      if (p.must_change_password) {
        const encodedNext = encodeURIComponent(destination);
        destination = `/change-password?next=${encodedNext}`;
      }

      router.replace(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Grid background */}
      <div className={styles.bgGrid} aria-hidden="true">
        <div className={styles.gridPattern} />
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />
        <div className={styles.fadeLeft} />
        <div className={styles.fadeRight} />
      </div>

      {/* ── TTU Institution Header ── */}
      <div className={styles.institutionHeader}>
        <Image
          src="/ttu_logo.png"
          alt="Takoradi Technical University logo"
          width={40}
          height={40}
          className={styles.institutionLogo}
        />
        <span className={styles.institutionName}>Takoradi Technical University</span>
      </div>

      <main className={styles.main}>
        {/* Wordmark using exact sidebar brand typography */}
        <h1 className={styles.brandTitle}>ATTENDSYS</h1>

        {/* ── OPTIONS VIEW ── */}
        {authView === "logout" && (
          <div className={styles.fadeIn}>
            <div className={styles.subHeadingGroup}>
              <p className={styles.subTitle}>Welcome to AttendSys.</p>
              <p className={styles.subDesc}>
                Sign in to continue managing attendance.
              </p>
            </div>

            <div className={styles.optionsStack}>
              {/* Email — Enabled */}
              <button
                type="button"
                onClick={() => setAuthView("email-form")}
                className={styles.optionBtn}
              >
                <span className={styles.optionIconLeft}>
                  <Mail size={18} strokeWidth={1.75} />
                </span>
                Continue with Email
              </button>

              {/* Phone — Temporarily Disabled */}
              <button
                type="button"
                disabled
                className={`${styles.optionBtn} ${styles.disabledOptionBtn}`}
                title="Phone sign-in is temporarily disabled"
              >
                <span className={styles.optionIconLeft}>
                  <Phone size={18} strokeWidth={1.75} />
                </span>
                <span>Continue with Phone</span>
                <span className={styles.disabledBadge}>Coming Soon</span>
              </button>

              {/* Google — Temporarily Disabled */}
              <button
                type="button"
                disabled
                className={`${styles.optionBtn} ${styles.disabledOptionBtn}`}
                title="Google sign-in is temporarily disabled"
              >
                <span className={styles.optionIconLeft}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </span>
                <span>Continue with Google</span>
                <span className={styles.disabledBadge}>Coming Soon</span>
              </button>
            </div>
          </div>
        )}

        {/* ── EMAIL & PASSWORD FORM (Routiness Aesthetic) ── */}
        {authView === "email-form" && (
          <form onSubmit={handlePasswordLogin} className={`${styles.fadeIn} ${styles.formBody}`}>
            {error && (
              <div className={styles.errorBox} role="alert">
                <AlertCircle size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field with Floating Notch Label */}
            <div className={styles.inputFieldGroup}>
              <span className={styles.floatingLabel}>Email</span>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  required
                  placeholder="name@ttu.edu.gh"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={styles.notchInput}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field with Floating Notch Label & Eye Toggle */}
            <div className={styles.inputFieldGroup}>
              <span className={styles.floatingLabel}>Password</span>
              <div className={styles.inputWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className={styles.notchInput}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.75} />
                  ) : (
                    <Eye size={18} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className={styles.spinIcon} />
                  <span>SIGNING IN…</span>
                </>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>

            {/* Forgot password link */}
            <div>
              <button
                type="button"
                onClick={() =>
                  alert("To reset your password, contact your department administrator or the ICT Helpdesk.")
                }
                className={styles.forgotLink}
              >
                Forgot password?
              </button>
            </div>

            {/* Back button to return to options */}
            <div className={styles.backBtnRow}>
              <button
                type="button"
                onClick={() => {
                  setAuthView("logout");
                  setError(null);
                }}
                className={styles.backBtn}
              >
                ← Back to options
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          By continuing you agree to AttendSys{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={styles.footerLink}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={styles.footerLink}
          >
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
