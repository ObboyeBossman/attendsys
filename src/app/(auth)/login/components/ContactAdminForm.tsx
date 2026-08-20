"use client";

import React, { useState } from "react";
import { Clock, GraduationCap, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitSupportRequest, type SupportRequestRole } from "@/actions/support-requests";
import styles from "./ContactAdminForm.module.css";
import loginStyles from "../LoginClient.module.css";

interface ContactAdminFormProps {
  onBack: () => void;
  /** SFR-AUTH-14: Callback when request is successfully sent */
  onSuccess?: (submittedEmail: string) => void;
  /** Pre-fill email if available from the login form */
  prefillEmail?: string;
}

export function ContactAdminForm({ onBack, onSuccess, prefillEmail = "" }: ContactAdminFormProps) {
  const [role, setRole] = useState<SupportRequestRole>("student");
  const [email, setEmail] = useState(prefillEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading || submitted) return;

    setError(null);
    setLoading(true);

    const result = await submitSupportRequest({ email, role, subject, message });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (onSuccess) {
      onSuccess(email);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className={`${loginStyles.fadeIn} ${loginStyles.formBody}`}>
      {/* Heading */}
      <div className={loginStyles.subHeadingGroup}>
        <p className={loginStyles.subTitle}>Contact Admin</p>
        <p className={loginStyles.subDesc}>
          Submit your issue and we&apos;ll get back to you.
        </p>
      </div>

      <div className={styles.form}>
        {/* SLA notice */}
        <div className={styles.slaBanner}>
          <Clock size={16} strokeWidth={1.75} className={styles.slaIcon} />
          <p className={styles.slaText}>
            Your administrator will respond within{" "}
            <strong>3 working days</strong>. Make sure the email below is
            correct so they can reach you.
          </p>
        </div>

        {/* Role selector */}
        <div className={styles.roleRow}>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === "student" ? styles.roleBtnActive : ""}`}
            onClick={() => setRole("student")}
            disabled={loading || submitted}
            aria-pressed={role === "student"}
          >
            <GraduationCap size={16} strokeWidth={1.75} />
            Student
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === "lecturer" ? styles.roleBtnActive : ""}`}
            onClick={() => setRole("lecturer")}
            disabled={loading || submitted}
            aria-pressed={role === "lecturer"}
          >
            <BookOpen size={16} strokeWidth={1.75} />
            Lecturer
          </button>
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="ca-email" className={styles.label}>
            Your email address
          </label>
          <input
            id="ca-email"
            type="email"
            className={styles.input}
            placeholder="name@ttu.edu.gh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || submitted}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        {/* Subject */}
        <div className={styles.field}>
          <label htmlFor="ca-subject" className={styles.label}>
            Subject
          </label>
          <input
            id="ca-subject"
            type="text"
            className={styles.input}
            placeholder="e.g. Cannot log in to my account"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading || submitted}
            maxLength={120}
          />
        </div>

        {/* Message */}
        <div className={styles.field}>
          <label htmlFor="ca-message" className={styles.label}>
            Describe your issue
          </label>
          <textarea
            id="ca-message"
            className={styles.textarea}
            placeholder="Tell us what happened, what you've tried, and what you need help with…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || submitted}
            rows={4}
          />
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={15} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* Submit / success pill */}
        {submitted ? (
          <>
            <div className={styles.successPill} role="status">
              <CheckCircle2 size={16} strokeWidth={2} />
              Request submitted
            </div>
            <p className={styles.successDesc}>
              We&apos;ll review your request and reply to <strong>{email}</strong>{" "}
              within 3 working days.
            </p>
          </>
        ) : (
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send Request"
            )}
          </button>
        )}

        {/* Back */}
        <div className={styles.backRow}>
          <button
            type="button"
            className={loginStyles.backBtn}
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
