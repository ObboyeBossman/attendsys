import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Layers,
  Users2,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Management | Admin",
  description: "Manage institution structure, academic years, semesters, groups, and courses.",
};

const MANAGEMENT_SECTIONS = [
  {
    title: "Institution",
    description: "Faculties, departments, programmes, qualification types, and levels.",
    href: "/admin/institution",
    icon: Building2,
  },
  {
    title: "Academic Years",
    description: "Create and manage academic years and track active enrolment cycles.",
    href: "/admin/academic-years",
    icon: CalendarDays,
  },
  {
    title: "Semesters",
    description: "Define semester periods, set active semesters, and manage timelines.",
    href: "/admin/semesters",
    icon: Layers,
  },
  {
    title: "Groups",
    description: "Organise student cohorts by qualification, level, and academic year.",
    href: "/admin/groups",
    icon: Users2,
  },
  {
    title: "Courses",
    description: "Assign courses to groups, link lecturers, and track session counts.",
    href: "/admin/courses",
    icon: BookOpen,
  },
] as const;

export default function ManagementPage() {
  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        paddingBottom: "3rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: "0.5rem",
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
          Configure and manage all academic and institutional structures in one place.
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
        {MANAGEMENT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1.375rem 1.5rem",
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
                textDecoration: "none",
                color: "inherit",
                transition: "box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              className="mgmt-card"
            >
              {/* Icon */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#111827",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.25,
                    margin: "0 0 0.375rem",
                  }}
                >
                  {section.title}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748B",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .mgmt-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
          border-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
