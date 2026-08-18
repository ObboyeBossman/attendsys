"use client";

import { useRef, useLayoutEffect, useState } from "react";
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
// Active state: heavier stroke (2) to communicate selection without color alone.
// Inactive: standard 1.75 stroke.
function NavIcon({ name, active }: { name: NavIconName; active: boolean }) {
  const p = { size: 22, strokeWidth: active ? 2 : 1.75 };
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
  // Show first 4 items when switchTo is present; 5 otherwise
  const displayedItems = navItems.slice(0, switchTo ? 4 : 5);

  const activeIndex = displayedItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
  );

  // Sliding pill — tracks the active item's measured DOM position
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const idx = activeIndex === -1 ? 0 : activeIndex;
    const el = itemRefs.current[idx];
    if (!el) return;

    const parent = el.parentElement as HTMLElement;
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setPillStyle({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    });
    setMounted(true);
  }, [activeIndex, pathname]);

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <div className={styles.container}>
        {/* Sliding black pill — renders only after first measurement */}
        {mounted && (
          <span
            className={styles.pill}
            style={{ left: pillStyle.left, width: pillStyle.width }}
            aria-hidden="true"
          />
        )}

        {displayedItems.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el: HTMLAnchorElement | null) => {
                itemRefs.current[index] = el;
              }}
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

        {/* Portal switcher — not tracked by pill */}
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

      {/* iOS home indicator — signals swipe-up affordance */}
      <div className={styles.homeIndicator} aria-hidden="true" />
    </nav>
  );
}
