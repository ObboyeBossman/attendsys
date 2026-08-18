import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Building,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Institution Overview | Admin",
  description: "Configure university faculties, departments, programmes, qualification types, and academic levels.",
};

const INSTITUTION_SECTIONS = [
  {
    title: "Faculties",
    description: "Configure academic faculties and schools across the university.",
    href: "/admin/institution/faculties",
    icon: Building2,
    badge: "Structure",
  },
  {
    title: "Departments",
    description: "Manage academic departments assigned under each faculty.",
    href: "/admin/institution/departments",
    icon: Building,
    badge: "Structure",
  },
  {
    title: "Programmes",
    description: "Set up degree programmes, majors, and fields of study.",
    href: "/admin/institution/programmes",
    icon: BookOpen,
    badge: "Academic",
  },
  {
    title: "Qualification Types",
    description: "Define award degrees and certificates (e.g. BSc, MSc, HND, Diploma).",
    href: "/admin/institution/qualification-types",
    icon: Award,
    badge: "Academic",
  },
  {
    title: "Levels",
    description: "Configure student level classifications (e.g. 100, 200, 300, 400).",
    href: "/admin/institution/levels",
    icon: Layers,
    badge: "Academic",
  },
] as const;

export default function InstitutionIndexPage() {
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
          Institution Setup
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#64748B", lineHeight: 1.5 }}>
          Select a category below to configure faculties, departments, degree programmes, qualification types, and academic levels.
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
        {INSTITUTION_SECTIONS.map((section) => {
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
              className="institution-sub-card"
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
                      color: "#64748B",
                      background: "#F1F5F9",
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
                  color: "#1A42C2",
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
