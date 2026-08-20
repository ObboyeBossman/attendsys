"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./ChangePasswordForm.module.css";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

export function ChangePasswordForm({ portalPrefix }: { portalPrefix: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Supabase updateUser automatically changes the password for the logged-in user
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      // Unset the must_change_password flag
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from("user_profiles") as any)
          .update({ must_change_password: false })
          .eq("id", user.id);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`${portalPrefix}/dashboard`);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={28} strokeWidth={1.75} />
        </div>
        <h2 className={styles.successTitle}>Password Updated</h2>
        <p className={styles.successText}>Redirecting you to the dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={18} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="new-password">
          New Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            required
            className={styles.input}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
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
        <PasswordStrengthIndicator password={password} />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="confirm-password">
          Confirm Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            required
            className={`${styles.input}${confirmPassword && confirmPassword === password ? ` ${styles.inputMatchOk}` : ""}`}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            minLength={8}
          />
          <button
            type="button"
            className={styles.eyeToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} strokeWidth={1.75} />
            ) : (
              <Eye size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>
        <PasswordStrengthIndicator
          password={password}
          confirmPassword={confirmPassword}
        />
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading || !password || !confirmPassword}
      >
        {loading ? "Updating password…" : "Update Password"}
      </button>
    </form>
  );
}
