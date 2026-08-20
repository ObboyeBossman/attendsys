"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FullscreenLoader } from "@/components/layout";
import { Input, Button, Toast } from "@/components/ui";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(formatAuthErrorMessage(signInError));
        setLoading(false);
        return;
      }

      const user = signInData?.user;
      if (!user) {
        setError("Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

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
