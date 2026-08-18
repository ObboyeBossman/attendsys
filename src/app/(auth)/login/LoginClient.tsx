"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MethodSelection } from "./components/MethodSelection";
import { EmailLoginForm } from "./components/EmailLoginForm";
import styles from "./LoginClient.module.css";

type AuthView = "logout" | "email-form";

export function LoginClient() {
  const [authView, setAuthView] = useState<AuthView>("logout");

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

        {/* ── VIEW SWITCHER ── */}
        {authView === "logout" ? (
          <MethodSelection onSelectEmail={() => setAuthView("email-form")} />
        ) : (
          <EmailLoginForm onBack={() => setAuthView("logout")} />
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
