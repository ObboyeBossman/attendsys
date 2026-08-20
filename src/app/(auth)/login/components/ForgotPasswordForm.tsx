"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input, Button, Toast } from "@/components/ui";
import styles from "../LoginClient.module.css";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setError(null);
    setLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${origin}/change-password`,
        }
      );

      if (resetError) {
        setError(resetError.message || "Failed to send reset link. Please try again.");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Toast
          message={error}
          variant="error"
          onDismiss={() => setError(null)}
        />
      )}

      {sent ? (
        <div className={`${styles.fadeIn} ${styles.formBody}`}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-full)",
                background: "var(--color-present-bg)",
                color: "var(--color-present)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
            <h2
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: 6,
              }}
            >
              Reset link sent
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-2)",
                lineHeight: 1.55,
                marginBottom: 20,
              }}
            >
              We sent password recovery instructions to <strong>{email}</strong>. Check your inbox and spam folder.
            </p>
          </div>

          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onBack}
            style={{ color: "var(--color-text-2)", fontSize: "var(--text-sm)" }}
          >
            ← Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className={`${styles.fadeIn} ${styles.formBody}`}>
          <div className={styles.subHeadingGroup}>
            <p className={styles.subTitle}>Reset your password</p>
            <p className={styles.subDesc}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={true}
            style={{ width: "100%", marginTop: 8 }}
          >
            {loading ? "SENDING LINK…" : "SEND RESET LINK"}
          </Button>

          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-3)",
              textAlign: "center",
              lineHeight: 1.5,
              marginTop: 12,
            }}
          >
            For institutional assistance, contact your department administrator or the ICT Helpdesk.
          </p>

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
      )}
    </>
  );
}
