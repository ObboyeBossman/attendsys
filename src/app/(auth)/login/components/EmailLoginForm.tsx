"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [error, setError] = useState<string | null>(null);

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
          onClick={onBack}
          className={styles.backBtn}
        >
          ← Back to options
        </button>
      </div>
    </form>
  );
}
