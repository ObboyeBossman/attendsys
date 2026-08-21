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
  Library,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Management | Admin",
};

const MANAGEMENT_SECTIONS = [
  { title: "Faculties",           subtitle: "Structure", href: "/admin/institution/faculties",           icon: Building2,     tier: "structure" },
  { title: "Departments",         subtitle: "Structure", href: "/admin/institution/departments",         icon: Building,      tier: "structure" },
  { title: "Programmes",          subtitle: "Academic",  href: "/admin/institution/programmes",          icon: Library,       tier: "academic"  },
  { title: "Qualification Types", subtitle: "Academic",  href: "/admin/institution/qualification-types", icon: Award,         tier: "academic"  },
  { title: "Levels",              subtitle: "Academic",  href: "/admin/institution/levels",              icon: Layers,        tier: "academic"  },
  { title: "Academic Years",      subtitle: "Academic",  href: "/admin/academic-years",                  icon: GraduationCap, tier: "academic"  },
  { title: "Semesters",           subtitle: "Academic",  href: "/admin/semesters",                       icon: CalendarDays,  tier: "academic"  },
  { title: "Groups",              subtitle: "Students",  href: "/admin/groups",                          icon: Users,         tier: "students"  },
  { title: "Courses",             subtitle: "Academic",  href: "/admin/courses",                         icon: BookOpen,      tier: "academic"  },
] as const;

// Tier icon backgrounds map to existing token surfaces:
//   structure → --color-surface-2 (neutral slate fill)
//   academic  → --color-brand-subtle (indigo tint)
//   students  → a green-tinted surface (no token exists yet; closest is surface-2)
// We use CSS custom properties so these stay in the token layer.
const TIER_ICON_VAR: Record<string, string> = {
  structure: "var(--color-surface-2)",
  academic:  "var(--color-brand-subtle)",
  students:  "var(--color-surface-2)",
};

export default function ManagementPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "var(--space-8)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-3)",
        }}
        className="mgmt-grid"
      >
        {MANAGEMENT_SECTIONS.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="mgmt-card"
              style={{
                display:        "flex",
                flexDirection:  "column",
                padding:        "var(--space-5)",
                borderRadius:   "var(--radius-xl)",
                background:     "var(--color-surface)",
                border:         "1px solid var(--color-border)",
                boxShadow:      "var(--shadow-card)",
                textDecoration: "none",
                color:          "inherit",
                transition:     "all 180ms var(--ease-out)",
                animationDelay: `${index * 35}ms`,
              }}
            >
              <div
                className="mgmt-icon"
                style={{
                  width:           "48px",
                  height:          "48px",
                  borderRadius:    "var(--radius-lg)",
                  background:      TIER_ICON_VAR[section.tier],
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  color:           "var(--color-text-primary)",
                  marginBottom:    "var(--space-3)",
                }}
              >
                <IconComponent size={22} strokeWidth={1.75} />
              </div>

              <span
                className="mgmt-title"
                style={{
                  fontSize:      "0.9375rem",
                  fontWeight:    "var(--font-bold)",
                  color:         "var(--color-text-primary)",
                  letterSpacing: "var(--tracking-normal)",
                  display:       "block",
                  marginBottom:  "var(--space-1)",
                }}
              >
                {section.title}
              </span>

              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color:    "var(--color-text-meta)",
                }}
              >
                {section.subtitle}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .mgmt-card { animation: mgmt-in 260ms var(--ease-out) both; }
        @keyframes mgmt-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mgmt-card:hover {
          transform:  translateY(-2px);
          box-shadow: var(--shadow-raised);
        }
        @media (prefers-reduced-motion: reduce) {
          .mgmt-card { animation: none; }
          .mgmt-card:hover { transform: none; }
        }
        @media (max-width: 480px) {
          .mgmt-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mgmt-card { padding: var(--space-4) !important; }
          .mgmt-card:hover { transform: none; }
          .mgmt-icon { width: 40px !important; height: 40px !important; margin-bottom: var(--space-3) !important; }
          .mgmt-title { font-size: var(--text-sm) !important; }
        }
      `}</style>
    </div>
  );
}
