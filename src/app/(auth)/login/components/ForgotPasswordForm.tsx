"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input, Button, Toast, Badge } from "@/components/ui";
import styles from "../LoginClient.module.css";

import { formatAuthErrorMessage } from "@/lib/auth-errors";

interface ForgotPasswordFormProps {
  onBack: () => void;
  /** SFR-AUTH-14: navigate to contact-admin view */
  onContactAdmin?: () => void;
  /** SFR-AUTH-14: pass typed email to pre-fill the contact form */
  prefillEmail?: string;
}

export function ForgotPasswordForm({ onBack, onContactAdmin, prefillEmail = "" }: ForgotPasswordFormProps) {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState(prefillEmail);
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
        setError(formatAuthErrorMessage(resetError, "Failed to send reset link. Please try again."));
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(formatAuthErrorMessage(err, "An unexpected error occurred. Please try again."));
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
        <form onSubmit={(e) => e.preventDefault()} className={`${styles.fadeIn} ${styles.formBody}`}>
          <div className={styles.subHeadingGroup}>
            <p className={styles.subTitle}>Password Reset Disabled</p>
            <p className={styles.subDesc}>
              Automated password reset links are disabled for institutional security.
            </p>
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="name@ttu.edu.gh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={true}
          />

          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={true}
            leftIcon={<Mail size={18} strokeWidth={1.75} />}
            rightIcon={<Badge variant="neutral">Disabled</Badge>}
            style={{ width: "100%", justifyContent: "space-between", paddingLeft: 20, marginTop: 8 }}
            title="Password reset link is disabled"
          >
            Send Reset Link
          </Button>

          {/* ── Divider ───────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "4px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: 11,
                color: "#94A3B8",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          </div>

          {/* ── SFR-AUTH-14: Contact Admin CTA ───────────────────── */}
          <button
            type="button"
            className={styles.optionBtn}
            onClick={onContactAdmin}
            disabled={!onContactAdmin}
            style={{ gap: 10 }}
          >
            <span className={styles.optionIconLeft}>
              <MessageSquare size={18} strokeWidth={1.75} />
            </span>
            Contact Administrator
          </button>

          {/* SLA hint */}
          <p
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 12,
              color: "#94A3B8",
              textAlign: "center",
              lineHeight: 1.5,
              margin: "0 auto",
              maxWidth: 260,
            }}
          >
            Submit your issue — we respond within 3 working days.
          </p>

          <div className={styles.backBtnRow} style={{ marginTop: 4 }}>
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
        </form>
      )}
    </>
  );
}
