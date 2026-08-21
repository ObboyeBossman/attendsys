"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./PortalLayout.module.css";
import { PageShimmer } from "./PageTransition";
import { BrandLogo, BrandText } from "@/components/brand";
import { Button } from "@/components/ui";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { useFullscreenLoader } from "./FullscreenLoader";
import { clearClientStorage } from "@/lib/clear-client-storage";

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
  ChevronsRight,
  LogOut,
  ArrowRightLeft,
  Activity,
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
  | "history"
  | "monitor";

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
    case "monitor":
      return <Activity {...iconProps} />;
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
  lecturer: "var(--color-primary)",
  rep: "var(--color-primary)",
  student: "var(--color-primary)",
};

const ROLE_INITIALS: Record<string, string> = {
  super_admin: "A",
  lecturer: "L",
  rep: "R",
  student: "S",
};

// ── Hoisted BrandMark sub-component ──────────────────────────────────────────
// roleLabel intentionally unused here — subtitle removed per design spec
function BrandMark({ roleLabel: _roleLabel }: { roleLabel: string }) {
  return (
    <>
      <BrandText size="lg" />
      <div className={styles.brandIconBtn} aria-label="AttendSys logo">
        <BrandLogo size="md" label="" />
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
  onSwitchPortal: (target: SwitchTarget) => void;
  userInitial: string;
  userName: string;
}

function NavLinks({ navItems, pathname, roleColor, roleLabel, role, switchTo, closeDrawer, onSignOut, onSwitchPortal, userInitial, userName }: NavLinksProps) {
  const router = useRouter();
  const settingsHref = navItems.find((item) => item.icon === "settings" || item.icon === "user")?.href || `/${role}/profile`;

  return (
    <>
      <div className={styles.navScrollArea}>
        <nav className={styles.nav} aria-label={`${roleLabel} navigation`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive = hasChildren && item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));

            return (
              <div key={item.href} className={styles.navGroup}>
                <button
                  type="button"
                  data-href={item.href}
                  onClick={() => {
                    closeDrawer();
                    router.push(item.href);
                  }}
                  className={`${styles.navItem} ${isActive || isChildActive ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon} data-icon={item.icon} style={{ position: "relative" }}>
                    <Icon name={item.icon} size={22} />
                    {!!item.badge && item.badge > 0 && (
                      <span
                        className={styles.navBadge}
                        aria-label={`${item.badge} unread`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </button>
                {hasChildren && (
                  <div className={styles.childNav}>
                    {item.children?.map((child) => {
                      const isChildSelfActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <button
                          key={child.href}
                          type="button"
                          data-href={child.href}
                          onClick={() => {
                            closeDrawer();
                            router.push(child.href);
                          }}
                          className={`${styles.childNavItem} ${isChildSelfActive ? styles.childNavItemActive : ""}`}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {switchTo && (
            <button
              type="button"
              className={styles.navItem}
              onClick={() => {
                closeDrawer();
                onSwitchPortal(switchTo);
              }}
            >
              <span className={styles.navIcon}>
                <ArrowRightLeft size={22} strokeWidth={1.75} />
              </span>
              <span>{switchTo.label}</span>
            </button>
          )}
          <button
            type="button"
            className={styles.navItem}
            onClick={onSignOut}
          >
            <span className={styles.navIcon}>
              <LogOut size={22} strokeWidth={1.75} />
            </span>
            <span>Sign out</span>
          </button>
        </nav>
      </div>
      <div className={styles.sidebarFooter}>
        <div className={styles.footerRow}>
          {/* Profile tile — navigates to settings without native browser URL hover preview */}
          <button
            type="button"
            className={styles.profileTile}
            onClick={() => {
              closeDrawer();
              router.push(settingsHref);
            }}
          >
            <div className={styles.profileAvatarRing}>
              <div className={styles.profileAvatar}>
                {userInitial}
              </div>
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userName || "User"}</span>
            </div>
            <Settings size={24} strokeWidth={2} className={styles.profileSettingsIcon} aria-hidden="true" />
          </button>

          {/* Back / close-drawer button — separate pill */}
          <button
            type="button"
            className={styles.backBtn}
            aria-label="Close menu"
            onClick={closeDrawer}
          >
            <ChevronsRight size={32} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── Swipe gesture constants ───────────────────────────────────────────────────
// On mobile the drawer is 100vw — we resolve the actual width at runtime in the handlers
const DRAWER_WIDTH = 320;          // fallback for desktop (unused); mobile uses window.innerWidth
const EDGE_ZONE = 80;              // px from left edge that initiates an open swipe
const OPEN_THRESHOLD = 0.4;        // fraction of drawer width to commit open
const CLOSE_THRESHOLD = 0.4;       // fraction of drawer width to commit closed
const VELOCITY_THRESHOLD = 0.4;    // px/ms — fast flick overrides distance check

export function PortalLayout({ role, roleLabel, navItems, children, switchTo }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { showLoader } = useFullscreenLoader();
  const roleColor = ROLE_COLORS[role];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userInitial, setUserInitial] = useState(ROLE_INITIALS[role]);
  const [userName, setUserName] = useState<string>("");

  const handleSwitchPortal = useCallback(
    (target: SwitchTarget) => {
      showLoader(`Connecting to ${target.label}…`);
      setTimeout(() => {
        window.location.href = target.href;
      }, 750);
    },
    [showLoader]
  );

  // ── Swipe gesture state (refs — no re-renders during drag) ───────────────
  const drawerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const swipeState = useRef<{
    tracking: boolean;
    startX: number;
    startY: number;
    currentX: number;
    startTime: number;
    drawerOpenAtStart: boolean;
    isHorizontal: boolean | null;  // null = direction not yet determined
  }>({
    tracking: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    startTime: 0,
    drawerOpenAtStart: false,
    isHorizontal: null,
  });
  const prefersReducedMotion = useRef(false);

  // Detect prefers-reduced-motion once on mount
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
  }, []);

  // ── Apply live drag transform directly to DOM (bypass React state) ───────
  const applyDragTransform = useCallback((translateX: number, backdropOpacity: number) => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    drawer.style.transition = "none";
    backdrop.style.transition = "none";
    drawer.style.transform = `translateX(${translateX}px)`;
    backdrop.style.opacity = String(backdropOpacity);
    backdrop.style.pointerEvents = backdropOpacity > 0 ? "auto" : "none";
  }, []);

  // ── Snap to final open/closed state (re-enable CSS transitions) ──────────
  const snapDrawer = useCallback((open: boolean) => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    // Re-enable CSS transitions for the snap animation
    drawer.style.transition = "";
    backdrop.style.transition = "";
    drawer.style.transform = "";
    backdrop.style.opacity = "";
    backdrop.style.pointerEvents = "";

    setDrawerOpen(open);
  }, []);

  // ── Touch event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    // Only attach on mobile — sidebar is hidden above 768px
    const isMobile = () => window.innerWidth <= 768;

    function onTouchStart(e: TouchEvent) {
      if (!isMobile()) return;
      if (prefersReducedMotion.current) return;

      const touch = e.touches[0];
      const state = swipeState.current;
      const isOpen = drawerRef.current?.classList.contains(styles.drawerOpen) ||
                     drawerRef.current?.style.transform === "translateX(0px)";
      const currentlyOpen = isOpen || document.body.style.overflow === "hidden";

      // Only initiate from left edge when closed, or anywhere on drawer when open
      if (!currentlyOpen && touch.clientX > EDGE_ZONE) return;

      state.tracking = true;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.currentX = touch.clientX;
      state.startTime = Date.now();
      state.drawerOpenAtStart = currentlyOpen;
      state.isHorizontal = null;
    }

    function onTouchMove(e: TouchEvent) {
      const state = swipeState.current;
      if (!state.tracking) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      // Determine direction on first significant move (prevents hijacking vertical scroll)
      if (state.isHorizontal === null) {
        if (Math.abs(deltaX) < 4 && Math.abs(deltaY) < 4) return;
        state.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        if (!state.isHorizontal) {
          state.tracking = false;
          return;
        }
      }

      if (!state.isHorizontal) return;

      // Prevent page scroll while we're handling the swipe
      e.preventDefault();

      state.currentX = touch.clientX;

      // On mobile the drawer is 100vw
      const effectiveWidth = window.innerWidth;

      if (state.drawerOpenAtStart) {
        // Closing: clamp deltaX to [−effectiveWidth, 0]
        const clampedDelta = Math.max(-effectiveWidth, Math.min(0, deltaX));
        const translateX = clampedDelta;
        const progress = 1 + clampedDelta / effectiveWidth; // 1→0
        applyDragTransform(translateX, progress * 0.45); // backdrop max opacity 0.45
      } else {
        // Opening: clamp deltaX to [0, effectiveWidth]
        const clampedDelta = Math.max(0, Math.min(effectiveWidth, deltaX));
        const translateX = -effectiveWidth + clampedDelta;
        const progress = clampedDelta / effectiveWidth; // 0→1
        applyDragTransform(translateX, progress * 0.45);
      }
    }

    function onTouchEnd() {
      const state = swipeState.current;
      if (!state.tracking) return;
      state.tracking = false;

      const deltaX = state.currentX - state.startX;
      const elapsed = Date.now() - state.startTime;
      const velocity = Math.abs(deltaX) / Math.max(elapsed, 1); // px/ms
      // On mobile the drawer is 100vw
      const effectiveWidth = window.innerWidth;
      const isFastFlick = velocity > VELOCITY_THRESHOLD;

      if (state.drawerOpenAtStart) {
        // Decide whether to close
        const shouldClose = isFastFlick
          ? deltaX < -10                                          // any leftward flick
          : deltaX < -(effectiveWidth * CLOSE_THRESHOLD);        // dragged > 40% left
        snapDrawer(!shouldClose);
      } else {
        // Decide whether to open
        const shouldOpen = isFastFlick
          ? deltaX > 10                                           // any rightward flick
          : deltaX > effectiveWidth * OPEN_THRESHOLD;            // dragged > 40% right
        snapDrawer(shouldOpen);
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyDragTransform, snapDrawer]);

  // Fetch real user name on mount
  useEffect(() => {
    async function fetchInitial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (role === "super_admin") {
        setUserInitial("A");
        setUserName("Admin");
        return;
      }
      const table = role === "rep" ? "students" : role === "lecturer" ? "lecturers" : "students";
      const { data } = await (supabase as any)
        .from(table)
        .select("name")
        .eq("id", user.id)
        .single();
      if (data?.name) {
        const fullName = data.name as string;
        setUserInitial(fullName.charAt(0).toUpperCase());
        setUserName(fullName);
      }
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
    // SFR-AUTH-08: wipe all client-side storage (localStorage + sessionStorage)
    // before handing off to the server. This ensures no session data (device
    // tokens, rate-limit counters, dismissed banners) is left behind for the
    // next person who opens the app on the same device.
    clearClientStorage();
    // Navigate to the server-side sign-out handler.
    // Client-side supabase.auth.signOut() cannot clear HttpOnly cookies
    // set by SFR-AUTH-03 — the server route handles cookie deletion properly.
    window.location.href = "/api/auth/signout";
  }

  // Derive pageTitle dynamically from pathname and navItems
  // ── Sidebar / drawer items: everything NOT shown on the bottom nav ────────
  // BottomNav slices navItems[0..maxNavItems-1]. The sidebar shows the rest,
  // avoiding duplication between the two navigation surfaces.
  const bottomNavMax = switchTo ? 2 : 3;
  const sidebarItems = navItems.slice(bottomNavMax);

  const activeNavItem = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
  );
  let activeChildTitle = "";
  if (activeNavItem?.children) {
    const matchedChild = activeNavItem.children.find(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    );
    if (matchedChild) activeChildTitle = matchedChild.label;
  }
  const rawSegment = pathname.split("/").filter(Boolean).pop() || "";
  const formattedSegment = rawSegment
    ? rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1).replace(/-/g, " ")
    : "";

  const pageTitle =
    activeChildTitle ||
    activeNavItem?.label ||
    (formattedSegment && formattedSegment !== "Admin" && formattedSegment !== "Student" && formattedSegment !== "Lecturer" && formattedSegment !== "Rep"
      ? formattedSegment
      : "Dashboard");

  return (
    <div className={styles.root} data-portal="portal-light">
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <BrandMark roleLabel={roleLabel} />
        </div>
        <NavLinks
          navItems={sidebarItems}
          pathname={pathname}
          roleColor={roleColor}
          roleLabel={roleLabel}
          role={role}
          switchTo={switchTo}
          closeDrawer={closeDrawer}
          onSignOut={openSignOut}
          onSwitchPortal={handleSwitchPortal}
          userInitial={userInitial}
          userName={userName}
        />
      </aside>

      {/* ── Mobile topbar ────────────────────────────────────────── */}
      {/* ── Top Bar (Mobile / Sticky) ───────────────────────────── */}
      <TopBar
        onMenuPress={() => setDrawerOpen(true)}
        onProfilePress={openSignOut}
        userInitial={userInitial}
        title={pageTitle}
        tabs={
          pathname.endsWith("/dashboard") && role === "super_admin"
            ? [{ id: "live", label: "Live" }, { id: "oversight", label: "Oversight" }]
            : pathname.endsWith("/dashboard") && role === "lecturer"
            ? [{ id: "today", label: "Today" }, { id: "calendar", label: "Calendar" }]
            : []
        }
      />

      {/* ── Mobile drawer overlay ─────────────────────────────────── */}
      <div
        ref={backdropRef}
        className={`${styles.drawerBackdrop} ${drawerOpen ? styles.drawerBackdropOpen : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-label="Navigation menu"
        aria-hidden={!drawerOpen}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <BrandMark roleLabel={roleLabel} />
          </div>
        </div>
        <NavLinks
          navItems={sidebarItems}
          pathname={pathname}
          roleColor={roleColor}
          roleLabel={roleLabel}
          role={role}
          switchTo={switchTo}
          closeDrawer={closeDrawer}
          onSignOut={openSignOut}
          onSwitchPortal={handleSwitchPortal}
          userInitial={userInitial}
          userName={userName}
        />
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className={styles.main}>
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
              <Button
                variant="secondary"
                onClick={() => setConfirmSignOut(false)}
                disabled={signingOut}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={signingOut}
                onClick={handleLogout}
                style={{ flex: 1 }}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
