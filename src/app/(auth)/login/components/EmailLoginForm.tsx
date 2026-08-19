"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FullscreenLoader } from "@/components/layout";
import { Input, Button, Toast } from "@/components/ui";
import styles from "../LoginClient.module.css";

interface EmailLoginFormProps {
  onBack: () => void;
}

function formatErrorMessage(err: any): string {
  if (!err) return "Invalid email or password. Please try again.";
  if (typeof err === "string" && err.trim() && err !== "{}") return err;
  if (typeof err?.message === "string" && err.message.trim() && err.message !== "{}") return err.message;
  if (typeof err?.error_description === "string") return err.error_description;
  return "Invalid email or password. Please check your credentials.";
}

export function EmailLoginForm({ onBack }: EmailLoginFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError(formatErrorMessage(signInError));
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
      setError(formatErrorMessage(err));
      setLoading(false);
    }
  };

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
          disabled={loading}
        />

        {/* Global Button Component for Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!email || !password}
          style={{ width: "100%", marginTop: 8 }}
        >
          {loading ? "SIGNING IN…" : "SIGN IN"}
        </Button>

        {/* Forgot password link */}
        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() =>
              alert("To reset your password, contact your department administrator or the ICT Helpdesk.")
            }
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
