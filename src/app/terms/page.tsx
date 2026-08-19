import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandText } from "@/components/brand";
import styles from "./terms.module.css";

export const metadata = {
  title: "Terms of Service — AttendSys",
  description: "Terms of Service and institutional conditions for Takoradi Technical University AttendSys application.",
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Image
            src="/ttu_logo.png"
            alt="Takoradi Technical University logo"
            width={36}
            height={36}
            className={styles.institutionLogo}
          />
          <BrandText size="md" />
        </div>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-2)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} /> Back to Sign In
        </Link>
      </header>

      <main className={styles.card}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>
          Takoradi Technical University • AttendSys Digital Attendance Platform • Effective Date: August 2026
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            By accessing or using the AttendSys web application and Progressive Web App (PWA) provided by Takoradi Technical University (TTU), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the application.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Institutional Authorized Use</h2>
          <p className={styles.paragraph}>
            AttendSys is exclusively designed and provided for enrolled students, academic lecturers, course representatives, and designated system administrators of Takoradi Technical University.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              You must log in using your authorized institutional credentials (student index number or official staff email).
            </li>
            <li className={styles.listItem}>
              You are strictly prohibited from transferring, sharing, or allowing third parties to access your account.
            </li>
            <li className={styles.listItem}>
              Each student account must be linked to a single personal device during active attendance verification sessions.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Academic Integrity & Anti-Fraud Policy</h2>
          <p className={styles.paragraph}>
            Takoradi Technical University enforces a zero-tolerance policy against attendance fraud and proxy check-ins:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Proxy Prevention:</strong> Using your account or device to register attendance for another student is a direct violation of university academic statutes.
            </li>
            <li className={styles.listItem}>
              <strong>Spoofing & Tampering:</strong> Attempting to manipulate GPS coordinates, falsify facial verification selfies, or tamper with device tokens will result in immediate account suspension and referral to the University Disciplinary Board.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Attendance Verification Methods</h2>
          <p className={styles.paragraph}>
            To verify physical presence in lectures, AttendSys utilizes:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Location services (GPS bounding box verification during active check-in moments).</li>
            <li className={styles.listItem}>Facial capture (live selfie verification stored securely for lecturer auditing).</li>
            <li className={styles.listItem}>Device binding tokens (binding one device per student per lecture session).</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Account Deactivation & Access Control</h2>
          <p className={styles.paragraph}>
            The university administration reserves the right to deactivate or suspend access to AttendSys for any user who violates academic statutes, exhibits suspicious check-in patterns, or terminates enrollment at Takoradi Technical University. Deactivated accounts will be immediately blocked across all portals.
          </p>
        </section>

        <div className={styles.footerNote}>
          <span className={styles.institutionText}>
            © {new Date().getFullYear()} Takoradi Technical University. All rights reserved.
          </span>
          <Link
            href="/privacy"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
