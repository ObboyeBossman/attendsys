"use client";

/**
 * Input — Centralized AttendSys Notch Input Component
 *
 * Features: floating notch label, right-icon slot, error state, helper text,
 *           password eye toggle built-in, textarea variant.
 */

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export function Input({
  label,
  error,
  helperText,
  rightIcon,
  onRightIconClick,
  className,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  const hasRightIcon = !!rightIcon || isPassword;

  return (
    <div className={styles.fieldGroup}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.inputWrap}>
        <input
          type={resolvedType}
          className={[
            styles.input,
            error ? styles.inputError : "",
            hasRightIcon ? styles.hasRightIcon : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.75} />
            ) : (
              <Eye size={18} strokeWidth={1.75} />
            )}
          </button>
        ) : rightIcon ? (
          <button
            type="button"
            className={styles.iconRight}
            onClick={onRightIconClick}
            tabIndex={-1}
            aria-label="Input action"
          >
            {rightIcon}
          </button>
        ) : null}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}

/* ── Textarea variant ──────────────────────────────────────────── */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className, ...props }: TextareaProps) {
  return (
    <div className={styles.fieldGroup}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea
        className={[
          styles.textarea,
          error ? styles.inputError : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
      {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
