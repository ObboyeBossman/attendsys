"use client";

import Link from "next/link";
import type { NavItem, NavIcon as NavIconName } from "./PortalLayout";
import styles from "./BottomNav.module.css";

// ── Props ─────────────────────────────────────────────────────────────────────
interface BottomNavProps {
  navItems: readonly NavItem[];
  pathname: string;
  switchTo?: { label: string; href: string };
  /** Full display name for the profile tile */
  userName?: string;
  /** Single letter initial for the avatar */
  userInitial?: string;
  /** Route the tile links to (profile or settings page) */
  settingsHref?: string;
  /** Called when the back chevron is pressed */
  onBack?: () => void;
}

// ── Back chevron ──────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BottomNav({
  userName = "",
  userInitial = "U",
  settingsHref = "/",
  onBack,
}: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Profile and settings">
      {/* The whole tile is a settings link — except the back button */}
      <Link href={settingsHref} className={styles.tile} aria-label="Go to settings">
        {/* Avatar */}
        <div className={styles.avatar} aria-hidden="true">
          {userInitial}
        </div>

        {/* Name + sub-label */}
        <div className={styles.nameBlock}>
          <span className={styles.userName}>
            {userName || "My Account"}
          </span>
          <span className={styles.subLabel}>Settings &amp; profile</span>
        </div>

        {/* Right chevron — decorative affordance */}
        <div className={styles.chevronRight} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>

      {/* Back button — sits outside the Link so it doesn't navigate to settings */}
      <button
        className={styles.backBtn}
        onClick={onBack}
        aria-label="Go back"
        type="button"
      >
        <BackIcon />
      </button>
    </nav>
  );
}
