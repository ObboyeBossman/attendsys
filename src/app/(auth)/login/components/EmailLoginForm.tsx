"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, RefreshCw, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FullscreenLoader } from "@/components/layout/FullscreenLoader";
import styles from "../LoginClient.module.css";

interface EmailLoginFormProps {
  onBack: () => void;
}

export function EmailLoginForm({ onBack }: EmailLoginFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStage, setAuthStage] = useState<string>("Checking credentials…");
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setError(null);
    setLoading(true);
    setAuthStage("Checking credentials…");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid login credentials");
        setLoading(false);
        return;
      }

      // Stage 2: Credentials verified, check user session & roles
      setAuthStage("Verifying account permissions…");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication failed. Please try again.");
        setLoading(false);
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
        setLoading(false);
        return;
      }

      const p = profile as { role: string; is_active: boolean; must_change_password: boolean };

      if (!p.is_active && p.role !== "student") {
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

      // Trigger navigation
      router.replace(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Global Stage-Aware Fullscreen Loader */}
      <FullscreenLoader visible={loading} message={authStage} />

      {/* Floating Custom Toast Banner */}
      {error && !loading && (
        <div className={styles.toastContainer} role="alert" aria-live="assertive">
          <div className={`${styles.toastCard} ${styles.toastError}`}>
            <AlertCircle size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span>{error}</span>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => setError(null)}
              aria-label="Dismiss notification"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handlePasswordLogin} className={`${styles.fadeIn} ${styles.formBody}`}>
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
            onClick={onBack}
            className={styles.backBtn}
          >
            ← Back to options
          </button>
        </div>
      </form>
    </>
  );
}
