"use client";

/**
 * Button — Centralized AttendSys Button Component
 *
 * Variants:  primary | secondary | outline | ghost | danger
 * Sizes:     sm | md | lg
 * Features:  Loading state with spinner, disabled state, icon support
 */

import React from "react";
import { RefreshCw } from "lucide-react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "text" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        isDisabled ? styles.disabled : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <RefreshCw size={15} strokeWidth={2} className={styles.spinIcon} aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
