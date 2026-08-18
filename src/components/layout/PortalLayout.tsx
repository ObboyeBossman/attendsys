"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./PortalLayout.module.css";
import { PageShimmer } from "./PageTransition";
import { NoticeBanner } from "./NoticeBanner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

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

export type NavIcon =
  | "dashboard"
  | "institution"
  | "academic"
  | "semesters"
  | "groups"
  | "users"
  | "courses"
  | "book"
  | "audit"
  | "feedback"
  | "flag"
  | "settings"
  | "video"
  | "clock"
  | "user"
  | "check"
  | "bell"
  | "calendar"
  | "star"
  | "history";

function Icon({ name, size = 18 }: { name: NavIcon; size?: number }) {
  const iconProps = { size, strokeWidth: 1.75 };

  switch (name) {
    case "dashboard":
      return <LayoutDashboard {...iconProps} />;
    case "institution":
      return <Building2 {...iconProps} />;
    case "academic":
      return <GraduationCap {...iconProps} />;
    case "semesters":
      return <Calendar {...iconProps} />;
    case "groups":
    case "users":
      return <Users {...iconProps} />;
    case "courses":
    case "book":
      return <BookOpen {...iconProps} />;
    case "audit":
      return <FileCheck2 {...iconProps} />;
    case "feedback":
    case "flag":
      return <Flag {...iconProps} />;
    case "settings":
      return <Settings {...iconProps} />;
    case "video":
      return <Video {...iconProps} />;
    case "clock":
      return <Clock {...iconProps} />;
    case "history":
      return <History {...iconProps} />;
    case "user":
      return <User {...iconProps} />;
    case "check":
      return <CheckCircle2 {...iconProps} />;
    case "bell":
      return <Bell {...iconProps} />;
    case "calendar":
      return <Calendar {...iconProps} />;
    case "star":
      return <Star {...iconProps} />;
    default:
      return null;
  }
}

export interface NavChildItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  badge?: number;
  children?: readonly NavChildItem[];
}

interface SwitchTarget {
  label: string;
  href: string;
}

export interface PortalLayoutProps {
  role: "super_admin" | "lecturer" | "rep" | "student";
  roleLabel: string;
  navItems: readonly NavItem[];
  homeUrl: string;
  children: React.ReactNode;
  /** When set, shows a portal-switcher button in the sidebar/bottom-nav */
  switchTo?: SwitchTarget;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "var(--color-primary)",
  lecturer: "#1A42C2",
  rep: "#1A42C2",
  student: "#1A42C2",
};

const ROLE_INITIALS: Record<string, string> = {
  super_admin: "A",
  lecturer: "L",
  rep: "R",
  student: "S",
};

// ── Hoisted BrandMark sub-component ──────────────────────────────────────────
function BrandMark({ roleLabel }: { roleLabel: string }) {
  return (
    <>
      <div className={styles.brandIcon}>
        <BrandLogo size="md" />
      </div>
      <div>
        <div className={styles.brandName}>AttendSys</div>
        <div className={styles.brandRole}>{roleLabel}</div>
      </div>
    </>
  );
}

interface NavLinksProps {
  navItems: readonly NavItem[];
  pathname: string;
  roleColor: string;
  roleLabel: string;
  role: string;
  switchTo?: SwitchTarget;
  closeDrawer: () => void;
  onSignOut: () => void;
  userInitial: string;
}

function NavLinks({ navItems, pathname, roleColor, roleLabel, switchTo, closeDrawer, onSignOut, userInitial }: NavLinksProps) {
  return (
    <>
      <nav className={styles.nav} aria-label={`${roleLabel} navigation`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          const hasChildren = item.children && item.children.length > 0;
          const isChildActive = hasChildren && item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));

          return (
            <div key={item.href} className={styles.navGroup}>
              <Link
                href={item.href}
                onClick={closeDrawer}
                className={`${styles.navItem} ${isActive || isChildActive ? styles.navItemActive : ""}`}
                style={(isActive || isChildActive) ? { "--role-color": roleColor } as React.CSSProperties : undefined}
              >
                <span className={styles.navIcon} data-icon={item.icon} style={{ position: "relative" }}>
                  <Icon name={item.icon} size={18} />
                  {!!item.badge && item.badge > 0 && (
                    <span
                      aria-label={`${item.badge} unread`}
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -6,
                        minWidth: 16,
                        height: 16,
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-primary)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        lineHeight: 1,
                      }}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
              {hasChildren && (
                <div className={styles.childNav}>
                  {item.children?.map((child) => {
                    const isChildSelfActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeDrawer}
                        className={`${styles.childNavItem} ${isChildSelfActive ? styles.childNavItemActive : ""}`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {switchTo && (
        <div className={styles.switcherWrap}>
          <Link href={switchTo.href} className={styles.switcherBtn}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10h12M10 4l6 6-6 6" />
            </svg>
            {switchTo.label}
          </Link>
        </div>
      )}
      <div className={styles.sidebarFooter}>
        <div className={styles.avatar}>
          {userInitial}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginLeft: "auto" }}>
          <button onClick={onSignOut} className={styles.logoutBtn} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-4-4-4M14 7H6" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export function PortalLayout({ role, roleLabel, navItems, children, switchTo }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const roleColor = ROLE_COLORS[role];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userInitial, setUserInitial] = useState(ROLE_INITIALS[role]);

  // Fetch real user name on mount
  useEffect(() => {
    async function fetchInitial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (role === "super_admin") {
        setUserInitial("A");
        return;
      }
      const table = role === "rep" ? "students" : role === "lecturer" ? "lecturers" : "students";
      const { data } = await (supabase as any)
        .from(table)
        .select("name")
        .eq("id", user.id)
        .single();
      if (data?.name) setUserInitial((data.name as string).charAt(0).toUpperCase());
    }
    fetchInitial();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen((open) => (open ? false : open));
  }, [pathname]);

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Lock body scroll when drawer or dialog is open
  useEffect(() => {
    if (drawerOpen || confirmSignOut) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, confirmSignOut]);

  // Close dialog on Escape
  useEffect(() => {
    if (!confirmSignOut) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setConfirmSignOut(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [confirmSignOut]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openSignOut = useCallback(() => setConfirmSignOut(true), []);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className={styles.root} data-portal="portal-light">
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <BrandMark roleLabel={roleLabel} />
        </div>
        <NavLinks
          navItems={navItems}
          pathname={pathname}
          roleColor={roleColor}
          roleLabel={roleLabel}
          role={role}
          switchTo={switchTo}
          closeDrawer={closeDrawer}
          onSignOut={openSignOut}
          userInitial={userInitial}
        />
      </aside>

      {/* ── Mobile topbar ────────────────────────────────────────── */}
      {/* ── Top Bar (Mobile / Sticky) ───────────────────────────── */}
      <TopBar
        onMenuPress={() => setDrawerOpen(true)}
        onProfilePress={openSignOut}
        userInitial={userInitial}
      />

      {/* ── Mobile drawer overlay ─────────────────────────────────── */}
      <div
        className={`${styles.drawerBackdrop} ${drawerOpen ? styles.drawerBackdropOpen : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-label="Navigation menu"
        aria-hidden={!drawerOpen}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <BrandMark roleLabel={roleLabel} />
          </div>
          <button
            className={styles.drawerClose}
            onClick={closeDrawer}
            aria-label="Close navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>
        <NavLinks
          navItems={navItems}
          pathname={pathname}
          roleColor={roleColor}
          roleLabel={roleLabel}
          role={role}
          switchTo={switchTo}
          closeDrawer={closeDrawer}
          onSignOut={openSignOut}
          userInitial={userInitial}
        />
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.noticeBannerBar}>
          <NoticeBanner />
        </div>
        <div className={styles.content} style={{ position: "relative" }}>
          <PageShimmer />
          {children}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ───────────────────────────────────── */}
      <BottomNav navItems={navItems} pathname={pathname} switchTo={switchTo} />

      {/* ── Sign-out confirmation dialog ─────────────────────────── */}
      {confirmSignOut && (
        <div
          className={styles.dialogOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmSignOut(false); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
        >
          <div className={styles.dialog}>
            <div className={styles.dialogIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 className={styles.dialogTitle} id="signout-title">Sign out?</h2>
            <p className={styles.dialogBody}>
              You&apos;ll be returned to the login screen. Any unsaved work will be lost.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancel}
                onClick={() => setConfirmSignOut(false)}
                disabled={signingOut}
              >
                Cancel
              </button>
              <button
                className={styles.dialogConfirm}
                onClick={handleLogout}
                disabled={signingOut}
              >
                {signingOut ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ animation: "spin 0.6s linear infinite" }}>
                      <path d="M7 1a6 6 0 1 0 6 6" />
                    </svg>
                    Signing out…
                  </>
                ) : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
