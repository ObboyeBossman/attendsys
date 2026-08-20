"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandText } from "@/components/brand";
import { Toast } from "@/components/ui";
import { MethodSelection } from "./components/MethodSelection";
import { EmailLoginForm } from "./components/EmailLoginForm";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { ContactAdminForm } from "./components/ContactAdminForm";
import styles from "./LoginClient.module.css";

// SFR-AUTH-14: "contact-admin" added to support pre-auth support requests
type AuthView = "logout" | "email-form" | "forgot-password" | "contact-admin";

interface LoginClientProps {
  /** SFR-AUTH-10: pre-filled email from device trust cookie (server-read) */
  rememberedEmail?: string;
  /** SFR-AUTH-10: display name from device trust cookie for "Welcome back" */
  rememberedName?: string;
}

export function LoginClient({ rememberedEmail = "", rememberedName = "" }: LoginClientProps) {
  const [authView, setAuthView] = useState<AuthView>(
    // If we have a remembered email, skip method selection and go straight to email form
    rememberedEmail ? "email-form" : "logout"
  );

  // SFR-AUTH-14: carry email across forgot-password → contact-admin so the
  // contact form can pre-fill it without the user retyping.
  const [carryEmail, setCarryEmail] = useState("");
  const [toastInfo, setToastInfo] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  return (
    <div className={styles.root}>
      {/* Toast Notification */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          variant={toastInfo.variant}
          duration={6000}
          onDismiss={() => setToastInfo(null)}
        />
      )}

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
        {/* Wordmark using central BrandText component */}
        <h1 className={styles.brandTitle}>
          <BrandText size="xl" />
        </h1>

        {/* ── VIEW SWITCHER ── */}
        {authView === "logout" && (
          <MethodSelection onSelectEmail={() => setAuthView("email-form")} />
        )}
        {authView === "email-form" && (
          <EmailLoginForm
            onBack={() => setAuthView("logout")}
            onForgotPassword={() => setAuthView("forgot-password")}
            rememberedEmail={carryEmail || rememberedEmail}
            rememberedName={rememberedName}
          />
        )}
        {authView === "forgot-password" && (
          <ForgotPasswordForm
            onBack={() => setAuthView("email-form")}
            onContactAdmin={() => setAuthView("contact-admin")}
            prefillEmail={carryEmail}
          />
        )}
        {/* SFR-AUTH-14: pre-auth contact form — no login required */}
        {authView === "contact-admin" && (
          <ContactAdminForm
            onBack={() => setAuthView("forgot-password")}
            onSuccess={(submittedEmail) => {
              setCarryEmail(submittedEmail);
              setAuthView("email-form");
              setToastInfo({
                message: `Support request submitted! Administrator will reply to ${submittedEmail} within 3 working days.`,
                variant: "success",
              });
            }}
            prefillEmail={carryEmail}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          By continuing you agree to AttendSys{" "}
          <Link href="/terms" className={styles.footerLink}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
