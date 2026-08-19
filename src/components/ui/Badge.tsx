"use client";

/**
 * Badge — Centralized AttendSys Status Badge Component
 *
 * Variants: present | late | absent | primary | success | warning | danger | info | neutral
 * Support: Optional icon slot, customizable className
 */

import React from "react";
import styles from "./Badge.module.css";

type BadgeVariant =
  | "present"
  | "late"
  | "absent"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}
