"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "@/components/auth/ChangePasswordForm.module.css";

import { formatAuthErrorMessage } from "@/lib/auth-errors";

function ChangePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const nextUrl = searchParams.get("next") ?? null;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setError("Session expired. Please sign in again.");
        router.replace("/login");
        return;
      }

      // Re-authenticate to verify current password
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reAuthError) {
        setError("Current password is incorrect.");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(formatAuthErrorMessage(updateError, "Failed to update password. Please try again."));
        return;
      }

      // Clear must_change_password flag
      await (supabase.from("user_profiles") as any)
        .update({ must_change_password: false })
        .eq("id", user.id);

      setSuccess(true);

      setTimeout(async () => {
        if (nextUrl) {
          router.replace(nextUrl);
          router.refresh();
          return;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = (profile as any)?.role ?? "";

        if (role === "student") {
          const { data: repMembership } = await supabase
            .from("group_memberships")
            .select("id")
            .eq("student_id", user.id)
            .eq("is_course_rep", true)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

          if (repMembership) {
            router.replace("/rep/dashboard");
            router.refresh();
            return;
          }
        }

        const roleMap: Record<string, string> = {
          super_admin: "/admin/dashboard",
          lecturer: "/lecturer/dashboard",
          student: "/student/dashboard",
        };

        router.replace(roleMap[role] ?? "/login");
        router.refresh();
      }, 1800);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={28} strokeWidth={1.75} />
        </div>
        <h2 className={styles.successTitle}>Password Updated</h2>
        <p className={styles.successText}>Redirecting you to your portal…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleChangePassword} className={styles.form}>
      {error && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={18} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Current password */}
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="current-password">
          Current Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            required
            className={styles.input}
            placeholder="Your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className={styles.eyeToggle}
            onClick={() => setShowCurrent(!showCurrent)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
          >
            {showCurrent ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* New password */}
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="new-password">
          New Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="new-password"
            type={showNew ? "text" : "password"}
            required
            className={styles.input}
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className={styles.eyeToggle}
            onClick={() => setShowNew(!showNew)}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="confirm-password">
          Confirm New Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            required
            className={styles.input}
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className={styles.eyeToggle}
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <button
        id="change-password-submit-btn"
        type="submit"
        className={styles.submitBtn}
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
      >
        {loading ? "Updating password…" : "Update Password"}
      </button>
    </form>
  );
}

export default function ChangePasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Set a New Password</h1>
        <p className={styles.subtitle}>
          You must change your password before continuing.
        </p>
      </div>
      <div className={styles.card}>
        <Suspense>
          <ChangePasswordInner />
        </Suspense>
      </div>
    </div>
  );
}
