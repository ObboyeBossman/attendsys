"use client";

/**
 * BrandText — Centralized AttendSys Wordmark Component
 *
 * Renders the official "AttendSys" brand wordmark using MuseoModerno font,
 * tracking (0.15em), and tokenized slate typography colors.
 *
 * Sizes: sm (16px) | md (20px) | lg (24px) | xl (30px)
 */

import React from "react";
import styles from "./BrandText.module.css";

type BrandTextSize = "sm" | "md" | "lg" | "xl";

interface BrandTextProps {
  size?: BrandTextSize;
  className?: string;
  children?: React.ReactNode;
}

export function BrandText({
  size = "lg",
  className,
  children = "AttendSys",
}: BrandTextProps) {
  return (
    <span
      className={[styles.brandText, styles[size], className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
