"use client";

/**
 * Card — Centralized AttendSys Card Component
 *
 * Variants: default | clickable
 * Padding:  none | sm | md | lg
 */

import React from "react";
import styles from "./Card.module.css";

type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}

const PAD_CLASS: Record<CardPadding, string> = {
  none: styles.padNone,
  sm:   styles.padSm,
  md:   styles.padMd,
  lg:   styles.padLg,
};

export function Card({
  children,
  padding = "md",
  clickable = false,
  onClick,
  className,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={[
        styles.card,
        PAD_CLASS[padding],
        clickable ? styles.clickable : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

/* ── Card sub-components ───────────────────────────────────────── */

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardDivider() {
  return <hr className={styles.divider} />;
}

/* ── Stat Card ─────────────────────────────────────────────────── */

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <Card padding="md" className={[styles.statCard, className ?? ""].join(" ")}>
      {icon && <div style={{ marginBottom: 8, color: "var(--color-text-3)" }}>{icon}</div>}
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </Card>
  );
}
