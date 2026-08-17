"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./PortalLayout.module.css";
import { PageShimmer } from "./PageTransition";
import { NoticeBanner } from "./NoticeBanner";
import { BrandLogo } from "@/components/brand/BrandLogo";

export type NavIcon =
  | "dashboard"
  | "institution"
  | "academic"
  | "semesters"
  | "groups"
  | "users"
  | "courses"
  | "audit"
  | "feedback"
  | "settings"
  | "book"
  | "video"
  | "flag"
  | "clock"
  | "user"
  | "check"
  | "bell"
  | "calendar"
  | "star"
  | "history";

function Icon({ name, size = 18 }: { name: NavIcon; size?: number }) {
  const props = { width: size, height: size, viewBox: `0 0 ${size} ${size}`, fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "dashboard":
      return <svg {...props}><rect x="1" y="1" width="7" height="7" rx="1.5" /><rect x="10" y="1" width="7" height="7" rx="1.5" /><rect x="1" y="10" width="7" height="7" rx="1.5" /><rect x="10" y="10" width="7" height="7" rx="1.5" /></svg>;
    case "institution":
      return <svg {...props}><path d="M1 17h16M3 17V7l6-5 6 5v10M7 17v-5h4v5" /></svg>;
    case "academic":
      return <svg {...props}><rect x="1" y="3" width="16" height="14" rx="1.5" /><path d="M1 7h16M6 1v4M12 1v4" /></svg>;
    case "semesters":
      return <svg {...props}><circle cx="9" cy="9" r="8" /><path d="M9 5v4l3 3" /></svg>;
    case "groups":
      return <svg {...props}><circle cx="6" cy="6" r="3" /><circle cx="12" cy="6" r="3" /><path d="M1 16c0-2.76 2.24-5 5-5M12 11c2.76 0 5 2.24 5 5" /><path d="M9 11c1.65 0 3 1.35 3 3" /></svg>;
    case "users":
      return <svg {...props}><circle cx="7" cy="6" r="3"/><circle cx="13" cy="6" r="3"/><path d="M1 18c0-3.31 2.69-6 6-6"/><path d="M13 12c3.31 0 6 2.69 6 6"/><path d="M10 12c1.66 0 3 1.34 3 3"/></svg>;
    case "courses":
    case "book":
      return <svg {...props}><path d="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>;
    case "audit":
      return <svg {...props}><path d="M3 1h12a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" /><path d="M6 6h6M6 9h6M6 12h4" /><circle cx="14" cy="14" r="3.5" fill="var(--color-bg)" stroke="currentColor" /><path d="M12.5 14h2M13.5 13v2" /></svg>;
    case "feedback":
    case "flag":
      return <svg {...props}><path d="M4 2v18M4 2h12l-3 5 3 5H4"/></svg>;
    case "settings":
      return <svg {...props}><circle cx="9" cy="9" r="3" /><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42" /></svg>;
    case "video":
      return <svg {...props}><rect x="2" y="5" width="12" height="10" rx="1.5"/><path d="M14 8l5-3v9l-5-3"/></svg>;
    case "clock":
    case "history":
      return <svg {...props}><circle cx="10" cy="10" r="8"/><path d="M10 5v5l4 4"/></svg>;
    case "user":
      return <svg {...props}><circle cx="10" cy="6" r="4"/><path d="M2 19c0-4.42 3.58-8 8-8s8 3.58 8 8"/></svg>;
    case "check":
      return <svg {...props}><path d="M4 10l5 5L19 4"/><circle cx="10" cy="10" r="9"/></svg>;
    case "bell":
      return <svg {...props}><path d="M10 2a6 6 0 00-6 6v3l-2 4h16l-2-4V8a6 6 0 00-6-6z"/><path d="M8 17a2 2 0 004 0"/></svg>;
    case "calendar":
      return <svg {...props}><rect x="2" y="4" width="16" height="15" rx="1.5"/><path d="M2 9h16M7 2v4M13 2v4"/></svg>;
    case "star":
      return <svg {...props}><path d="M10 2l2.36 4.78 5.27.77-3.81 3.72.9 5.24L10 14.1l-4.72 2.41.9-5.24L2.37 7.55l5.27-.77L10 2z"/></svg>;
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
                <span className={styles.navIcon} style={{ position: "relative" }}>
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
      <header className={styles.mobileTopbar}>
        <button
          className={styles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <div className={styles.mobileTopbarBrand}>
          <BrandLogo size="sm" />
          <div>
            <div className={styles.mobileTopbarTitle}>AttendSys</div>
            <div className={styles.mobileTopbarRole}>{roleLabel}</div>
          </div>
        </div>
      </header>

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

      {/* ── Bottom nav (mobile quick-access) ─────────────────────── */}
      <nav className={styles.bottomNav} aria-label="Mobile navigation">
        {navItems.slice(0, switchTo ? 4 : 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                <Icon name={item.icon} size={20} />
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
                      background: isActive ? "var(--color-bg)" : "var(--color-primary)",
                      color: isActive ? "var(--color-text)" : "#fff",
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
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </Link>
          );
        })}
        {switchTo && (
          <Link
            href={switchTo.href}
            className={styles.bottomNavItem}
            title={switchTo.label}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M4 10h12M10 4l6 6-6 6" />
            </svg>
            <span className={styles.bottomNavLabel}>Switch</span>
          </Link>
        )}
      </nav>

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
