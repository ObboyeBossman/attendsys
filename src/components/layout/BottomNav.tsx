"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  BookOpen,
  FileCheck2,
  Flag,
  Settings,
  Video,
  Clock,
  User,
  CheckCircle2,
  Bell,
  Star,
  History,
  GraduationCap,
} from "lucide-react";
import type { NavItem, NavIcon as NavIconName } from "./PortalLayout";
import styles from "./BottomNav.module.css";

// ── Icon renderer ─────────────────────────────────────────────────────────────
// Active: filled (fill="currentColor", no stroke) — solid presence.
// Inactive: outline (fill="none", stroke) — recedes into the background.
function NavIcon({ name, active }: { name: NavIconName; active: boolean }) {
  const base = { size: 22 };
  const filled = { ...base, strokeWidth: 0, fill: "currentColor" };
  const outline = { ...base, strokeWidth: 1.75, fill: "none" };
  const p = active ? filled : outline;

  switch (name) {
    case "dashboard":   return <LayoutDashboard {...p} />;
    case "institution": return <Building2 {...p} />;
    case "academic":    return <GraduationCap {...p} />;
    case "semesters":
    case "calendar":    return <Calendar {...p} />;
    case "groups":
    case "users":       return <Users {...p} />;
    case "courses":
    case "book":        return <BookOpen {...p} />;
    case "audit":       return <FileCheck2 {...p} />;
    case "feedback":
    case "flag":        return <Flag {...p} />;
    case "settings":    return <Settings {...p} />;
    case "video":       return <Video {...p} />;
    case "clock":       return <Clock {...p} />;
    case "history":     return <History {...p} />;
    case "user":        return <User {...p} />;
    case "check":       return <CheckCircle2 {...p} />;
    case "bell":        return <Bell {...p} />;
    case "star":        return <Star {...p} />;
    default:            return null;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface BottomNavProps {
  navItems: readonly NavItem[];
  pathname: string;
  switchTo?: { label: string; href: string };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BottomNav({ navItems, pathname, switchTo }: BottomNavProps) {
  // Strict maximum of 4 items on bottom navigation across all portals
  const displayedItems = navItems.slice(0, 4);

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <div className={styles.container}>
        {displayedItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.iconWrap}>
                {!!item.badge && item.badge > 0 && (
                  <span
                    className={styles.badge}
                    aria-label={`${item.badge} unread`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                <NavIcon name={item.icon} active={isActive} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}

        {switchTo && (
          <Link href={switchTo.href} className={styles.item}>
            <span className={styles.iconWrap}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 10h12M10 4l6 6-6 6" />
              </svg>
            </span>
            <span className={styles.label}>{switchTo.label}</span>
          </Link>
        )}
      </div>

    </nav>
  );
}
