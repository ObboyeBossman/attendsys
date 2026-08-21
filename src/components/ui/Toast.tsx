"use client";

/**
 * Toast — Centralized AttendSys Glassmorphic Toast Notification
 *
 * Variants: error | success | info | warning
 * Features: auto-dismiss (default 4s), manual dismiss, icon per variant
 */

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import styles from "./Toast.module.css";

type ToastVariant = "error" | "success" | "info" | "warning";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  duration?: number; // ms, 0 = no auto-dismiss
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  error:   <AlertCircle   size={18} strokeWidth={1.75} />,
  success: <CheckCircle   size={18} strokeWidth={1.75} />,
  info:    <Info          size={18} strokeWidth={1.75} />,
  warning: <AlertTriangle size={18} strokeWidth={1.75} />,
};

export function Toast({
  message,
  variant = "error",
  onDismiss,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className={styles.container} role="alert" aria-live="assertive">
      <div className={`${styles.card} ${styles[variant]}`}>
        <span className={styles.icon}>{ICONS[variant]}</span>
        <span className={styles.message}>{message}</span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
