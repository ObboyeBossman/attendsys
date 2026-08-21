"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { AdminContentWrapper } from "./AdminContentWrapper";
import { ADMIN_NAV_ITEMS } from "./adminNav";
import { PageShimmer } from "@/components/layout/PageTransition";

// Routes that open as standalone pages (no portal shell, back button header)
const STANDALONE_PREFIXES = [
  "/admin/institution",
  "/admin/academic-years",
  "/admin/semesters",
  "/admin/groups",
  "/admin/courses",
];

const BACK_LABELS: Record<string, string> = {
  "/admin/institution":    "Institution",
  "/admin/academic-years": "Academic Years",
  "/admin/semesters":      "Semesters",
  "/admin/groups":         "Groups",
  "/admin/courses":        "Courses",
};

function getPageTitle(pathname: string): string {
  for (const [prefix, label] of Object.entries(BACK_LABELS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return label;
  }
  return "";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isStandalone = STANDALONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (isStandalone) {
    const title = getPageTitle(pathname);
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Standalone header — back arrow + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1.25rem",
            position: "sticky",
            top: 0,
            background: "#FAFAFA",
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#EFEFEF",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#111827",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          {title && (
            <span
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#111827",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "0.5rem 1.25rem 2rem", position: "relative" }}>
          <PageShimmer />
          {children}
        </div>
      </div>
    );
  }

  // Default — full portal shell
  return (
    <PortalLayout
      role="super_admin"
      roleLabel="Super Admin"
      navItems={ADMIN_NAV_ITEMS}
      homeUrl="/admin/dashboard"
    >
      <AdminContentWrapper>{children}</AdminContentWrapper>
    </PortalLayout>
  );
}
