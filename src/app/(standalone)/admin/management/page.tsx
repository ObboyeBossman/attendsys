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
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Management | Admin",
};

type Section = {
  title:    string;
  subtitle: string;
  href:     string;
  icon:     React.ElementType;
  tier:     "structure" | "academic" | "students";
  count:    number | null;
};

async function getCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createSupabaseServerClient();

    const results = await Promise.all([
      (supabase as any).from("faculties")         .select("id", { count: "exact", head: true }),
      (supabase as any).from("departments")        .select("id", { count: "exact", head: true }),
      (supabase as any).from("programmes")         .select("id", { count: "exact", head: true }),
      (supabase as any).from("qualification_types").select("id", { count: "exact", head: true }),
      (supabase as any).from("levels")             .select("id", { count: "exact", head: true }),
      (supabase as any).from("academic_years")     .select("id", { count: "exact", head: true }),
      (supabase as any).from("app_semesters")      .select("id", { count: "exact", head: true }),
      (supabase as any).from("groups")             .select("id", { count: "exact", head: true }),
      (supabase as any).from("courses")            .select("id", { count: "exact", head: true }),
    ]);

    const [fac, dept, prog, qual, lvl, yr, sem, grp, crs] = results;
    return {
      faculties:          fac.count  ?? 0,
      departments:        dept.count ?? 0,
      programmes:         prog.count ?? 0,
      qualification_types:qual.count ?? 0,
      levels:             lvl.count  ?? 0,
      academic_years:     yr.count   ?? 0,
      app_semesters:      sem.count  ?? 0,
      groups:             grp.count  ?? 0,
      courses:            crs.count  ?? 0,
    };
  } catch {
    return {};
  }
}

const TIER_ICON_VAR: Record<string, string> = {
  structure: "var(--color-surface-2)",
  academic:  "var(--color-brand-subtle)",
  students:  "var(--color-surface-2)",
};

export default async function ManagementPage() {
  const counts = await getCounts();

  const SECTIONS: Section[] = [
    { title: "Faculties",           subtitle: "Structure", href: "/admin/institution/faculties",           icon: Building2,     tier: "structure", count: counts.faculties           ?? null },
    { title: "Departments",         subtitle: "Structure", href: "/admin/institution/departments",         icon: Building,      tier: "structure", count: counts.departments         ?? null },
    { title: "Programmes",          subtitle: "Academic",  href: "/admin/institution/programmes",          icon: Library,       tier: "academic",  count: counts.programmes          ?? null },
    { title: "Qualification Types", subtitle: "Academic",  href: "/admin/institution/qualification-types", icon: Award,         tier: "academic",  count: counts.qualification_types ?? null },
    { title: "Levels",              subtitle: "Academic",  href: "/admin/institution/levels",              icon: Layers,        tier: "academic",  count: counts.levels              ?? null },
    { title: "Academic Years",      subtitle: "Academic",  href: "/admin/academic-years",                  icon: GraduationCap, tier: "academic",  count: counts.academic_years      ?? null },
    { title: "Semesters",           subtitle: "Academic",  href: "/admin/semesters",                       icon: CalendarDays,  tier: "academic",  count: counts.app_semesters       ?? null },
    { title: "Groups",              subtitle: "Students",  href: "/admin/groups",                          icon: Users,         tier: "students",  count: counts.groups              ?? null },
    { title: "Courses",             subtitle: "Academic",  href: "/admin/courses",                         icon: BookOpen,      tier: "academic",  count: counts.courses             ?? null },
  ];

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
        {SECTIONS.map((section, index) => {
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
                position:       "relative",
              }}
            >
              {/* Count badge — top-right */}
              {section.count !== null && (
                <span
                  className="mgmt-count"
                  style={{
                    position:      "absolute",
                    top:           "var(--space-4)",
                    right:         "var(--space-4)",
                    fontSize:      "var(--text-xs)",
                    fontWeight:    "var(--font-semibold)",
                    color:         "var(--color-text-secondary)",
                    background:    "var(--color-surface-2)",
                    borderRadius:  "var(--radius-full)",
                    padding:       "2px 8px",
                    lineHeight:    1.5,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {section.count}
                </span>
              )}

              {/* Icon */}
              <div
                className="mgmt-icon"
                style={{
                  width:          "48px",
                  height:         "48px",
                  borderRadius:   "var(--radius-lg)",
                  background:     TIER_ICON_VAR[section.tier],
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  color:          "var(--color-text-primary)",
                  marginBottom:   "var(--space-3)",
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
