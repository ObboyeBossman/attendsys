import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo, BrandText } from "@/components/brand";
import styles from "./privacy.module.css";

export const metadata = {
  title: "Privacy Policy — AttendSys",
  description: "Privacy Policy and data protection guidelines for Takoradi Technical University AttendSys application.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <BrandLogo size={36} label="AttendSys" />
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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-surface-2)",
            color: "var(--color-primary)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          <ShieldCheck size={16} strokeWidth={2} /> Institutional Data Protection Standard
        </div>

        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          Takoradi Technical University • Data Privacy & Protection Policy • Effective Date: August 2026
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction & Institutional Commitment</h2>
          <p className={styles.paragraph}>
            Takoradi Technical University (&quot;TTU&quot;) is committed to protecting the privacy, security, and confidentiality of personal data collected through the AttendSys attendance management platform. This Privacy Policy outlines how your data is collected, stored, processed, and safeguarded.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
          <p className={styles.paragraph}>
            To operate the attendance verification system, AttendSys collects the following categories of data:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Identity Data:</strong> Full name, student index number / staff ID, academic programme, department, faculty, level, and institutional email address.
            </li>
            <li className={styles.listItem}>
              <strong>Attendance Data:</strong> Lecture session check-in timestamps, attendance status (present, late, absent), and dispute resolution logs.
            </li>
            <li className={styles.listItem}>
              <strong>Verification Assets:</strong> Live facial verification images (selfies taken at the moment of check-in) and device tokens generated for device verification.
            </li>
            <li className={styles.listItem}>
              <strong>Location Data:</strong> Geolocation coordinates (latitude, longitude, and accuracy) processed strictly during active check-in moments to verify physical presence within lecture boundaries.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. How Your Information Is Used</h2>
          <p className={styles.paragraph}>
            Your data is used strictly for legitimate academic and administrative purposes:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Verifying student physical presence during scheduled university lectures.</li>
            <li className={styles.listItem}>Generating official academic attendance reports for department heads and examination boards.</li>
            <li className={styles.listItem}>Resolving student attendance disputes and auditing check-in records.</li>
            <li className={styles.listItem}>Preventing unauthorized proxy check-ins and academic fraud.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Data Protection & Security Controls</h2>
          <p className={styles.paragraph}>
            AttendSys employs industry-standard security measures to safeguard your personal data:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Encryption in Transit:</strong> All communications between your device and our servers are encrypted using TLS 1.3 SSL protocols.
            </li>
            <li className={styles.listItem}>
              <strong>Strict Cookie Security:</strong> Session cookies are set with <code>HttpOnly</code>, <code>SameSite=Lax</code>, and <code>Secure</code> flags to prevent cross-site scripting (XSS) and request forgery (CSRF).
            </li>
            <li className={styles.listItem}>
              <strong>Role-Based Access Control:</strong> Access to selfie verification images and detailed attendance logs is restricted exclusively to authorized course lecturers and department administrators.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Advertising & Third-Party Sharing</h2>
          <p className={styles.paragraph}>
            AttendSys currently does not share student or staff personal data with external ad networks. For non-institutional tiers or free account tiers where sponsored announcements or ad placements may be introduced in future updates, advertising content will operate under strict anonymized guidelines, and personal identification data (such as selfies, index numbers, or exact GPS coordinates) will never be shared with advertisers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Contact & Support</h2>
          <p className={styles.paragraph}>
            If you have any questions or concerns regarding your privacy or data processing on AttendSys, please contact the Takoradi Technical University Directorate of ICT Services or your Department Administrator.
          </p>
        </section>

        <div className={styles.footerNote}>
          <span className={styles.institutionText}>
            © {new Date().getFullYear()} Takoradi Technical University. All rights reserved.
          </span>
          <Link
            href="/terms"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
