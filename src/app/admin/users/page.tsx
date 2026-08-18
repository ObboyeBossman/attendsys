import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage student accounts, lecturer profiles, and system administrator access.",
};

const USER_SECTIONS = [
  {
    title: "Students",
    description: "Manage student accounts, matric numbers, level assignments, and active statuses.",
    href: "/admin/users/students",
    icon: GraduationCap,
    badge: "Students",
    badgeBg: "#EFF6FF",
    badgeColor: "#1D4ED8",
  },
  {
    title: "Lecturers",
    description: "Manage lecturer accounts, faculty staff, course rep assignments, and department roles.",
    href: "/admin/users/lecturers",
    icon: UserCheck,
    badge: "Faculty",
    badgeBg: "#F0FDF4",
    badgeColor: "#15803D",
  },
  {
    title: "Super Admins",
    description: "Manage system administrators, security permissions, and administrative access rights.",
    href: "/admin/users/admins",
    icon: ShieldCheck,
    badge: "System",
    badgeBg: "#FEF2F2",
    badgeColor: "#B91C1C",
  },
] as const;

export default function UsersIndexPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          User Management
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#64748B", lineHeight: 1.5 }}>
          Select a user role category below to view accounts, manage profiles, assign permissions, and control access.
        </p>
      </div>

      {/* Sub-Button Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {USER_SECTIONS.map((section) => {
          const IconComponent = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.5rem",
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                position: "relative",
              }}
              className="user-sub-card"
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#F5F5F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#111827",
                    }}
                  >
                    <IconComponent size={22} strokeWidth={1.75} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: section.badgeColor,
                      background: section.badgeBg,
                      padding: "0.25rem 0.625rem",
                      borderRadius: "9999px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {section.badge}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "#111827",
                    letterSpacing: "-0.015em",
                    marginBottom: "0.5rem",
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748B",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {section.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.04)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                <span>Manage {section.title}</span>
                <ChevronRight size={18} strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
