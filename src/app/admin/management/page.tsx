import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Layers,
  Users2,
  BookOpen,
} from "lucide-react";
import styles from "./management.module.css";

export const metadata: Metadata = {
  title: "Management",
};

/* ── Section definitions ─────────────────────────────────────────────────── */

const SECTIONS = [
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

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function ManagementPage() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Management</h1>
        <p className={styles.subtitle}>
          Configure and manage all academic and institutional structures in one place.
        </p>
      </div>

      <div className={styles.grid}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className={styles.card}>
              <div className={styles.iconWrap} aria-hidden="true">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <p className={styles.cardTitle}>{section.title}</p>
                <p className={styles.cardDesc}>{section.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
