import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Management | Admin",
  description: "Configure institution setup, academic years, semesters, groups, and courses.",
};

const MANAGEMENT_SECTIONS = [
  {
    title: "Institution",
    description: "Faculties, departments, programmes, and qualification types.",
    href: "/admin/institution",
    icon: Building2,
    day: "Structure",
  },
  {
    title: "Academic Years",
    description: "Define and manage academic year cycles.",
    href: "/admin/academic-years",
    icon: GraduationCap,
    day: "Academic",
  },
  {
    title: "Semesters",
    description: "Set up semester periods within each academic year.",
    href: "/admin/semesters",
    icon: CalendarDays,
    day: "Academic",
  },
  {
    title: "Groups",
    description: "Organise students into class groups and cohorts.",
    href: "/admin/groups",
    icon: Users,
    day: "Students",
  },
  {
    title: "Courses",
    description: "Create and assign courses to programmes and lecturers.",
    href: "/admin/courses",
    icon: BookOpen,
    day: "Academic",
  },
] as const;

export default function ManagementPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
            fontFamily: "var(--font-plus-jakarta-sans, inherit)",
          }}
        >
          Management
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#64748B",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Configure your institution, academic structure, and course setup from one place.
        </p>
      </div>

      {/* Card Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {MANAGEMENT_SECTIONS.map((section, index) => {
          const IconComponent = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem",
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                animationDelay: `${index * 40}ms`,
              }}
              className="management-card"
            >
              {/* Icon pill + label row — matches reference image exactly */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                {/* Dark pill icon — the signature detail */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "#0A0A0A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={22} strokeWidth={1.75} />
                </div>

                {/* Category badge */}
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#64748B",
                    background: "#F1F5F9",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "9999px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    alignSelf: "center",
                  }}
                >
                  {section.day}
                </span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#111827",
                  letterSpacing: "-0.015em",
                  marginBottom: "0.375rem",
                  fontFamily: "var(--font-plus-jakarta-sans, inherit)",
                }}
              >
                {section.title}
              </h2>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748B",
                  lineHeight: 1.55,
                  margin: "0 0 1.25rem 0",
                  flexGrow: 1,
                }}
              >
                {section.description}
              </p>

              {/* Footer CTA */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.04)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                <span>Open {section.title}</span>
                <ChevronRight size={16} strokeWidth={2.25} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Hover + stagger styles */}
      <style>{`
        .management-card {
          animation: mgmt-card-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes mgmt-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .management-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
          border-color: rgba(0, 0, 0, 0.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .management-card { animation: none; }
          .management-card:hover { transform: none; }
        }
        @media (max-width: 480px) {
          .management-card:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}
