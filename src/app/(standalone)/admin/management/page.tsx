import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Building,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  CalendarDays,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Management | Admin",
};

const MANAGEMENT_SECTIONS = [
  { title: "Faculties",           subtitle: "Structure", href: "/admin/institution/faculties",          icon: Building2   },
  { title: "Departments",         subtitle: "Structure", href: "/admin/institution/departments",        icon: Building    },
  { title: "Programmes",          subtitle: "Academic",  href: "/admin/institution/programmes",         icon: BookOpen    },
  { title: "Qualification Types", subtitle: "Academic",  href: "/admin/institution/qualification-types",icon: Award       },
  { title: "Levels",              subtitle: "Academic",  href: "/admin/institution/levels",             icon: Layers      },
  { title: "Academic Years",      subtitle: "Academic",  href: "/admin/academic-years",                 icon: GraduationCap },
  { title: "Semesters",           subtitle: "Academic",  href: "/admin/semesters",                      icon: CalendarDays },
  { title: "Groups",              subtitle: "Students",  href: "/admin/groups",                         icon: Users       },
  { title: "Courses",             subtitle: "Academic",  href: "/admin/courses",                        icon: BookOpen    },
] as const;

export default function ManagementPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "2rem" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}
      >
        {MANAGEMENT_SECTIONS.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="mgmt-card"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1.25rem",
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                animationDelay: `${index * 40}ms`,
              }}
            >
              <div
                className="mgmt-icon"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "#0A0A0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  marginBottom: "0.875rem",
                }}
              >
                <IconComponent size={22} strokeWidth={1.75} />
              </div>

              <span
                className="mgmt-title"
                style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.015em", display: "block", marginBottom: "0.25rem" }}
              >
                {section.title}
              </span>

              <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                {section.subtitle}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .mgmt-card { animation: mgmt-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes mgmt-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mgmt-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        @media (prefers-reduced-motion: reduce) {
          .mgmt-card { animation: none; }
          .mgmt-card:hover { transform: none; }
        }
        @media (max-width: 480px) {
          .mgmt-card { padding: 1rem !important; }
          .mgmt-card:hover { transform: none; }
          .mgmt-icon { width: 40px !important; height: 40px !important; border-radius: 11px !important; margin-bottom: 0.75rem !important; }
          .mgmt-title { font-size: 0.875rem !important; }
        }
      `}</style>
    </div>
  );
}
