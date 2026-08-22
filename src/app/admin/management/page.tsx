import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Layers,
  Users2,
  BookOpen,
  Users,
} from "lucide-react";
import styles from "./management.module.css";

export const metadata: Metadata = {
  title: "Management",
};

/* ── Cluster definitions ─────────────────────────────────────────────────── */

const CLUSTERS = [
  {
    id: "structure",
    cards: [
      {
        title: "Institution",
        description: "Faculties, departments, programmes, qualification types, and levels.",
        href: "/admin/institution",
        icon: Building2,
      },
    ],
  },
  {
    id: "academic",
    cards: [
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
        title: "Courses",
        description: "Assign courses to groups, link lecturers, and track session counts.",
        href: "/admin/courses",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "people",
    cards: [
      {
        title: "Groups",
        description: "Organise student cohorts by qualification, level, and academic year.",
        href: "/admin/groups",
        icon: Users2,
      },
      {
        title: "Users",
        description: "Manage student, lecturer, and admin accounts across the institution.",
        href: "/admin/users",
        icon: Users,
      },
    ],
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

      <div className={styles.clusters}>
        {CLUSTERS.map((cluster) => (
          <div key={cluster.id} className={styles.cluster}>
            <div className={styles.grid}>
              {cluster.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.href} href={card.href} className={styles.card}>
                    <div className={styles.iconWrap} data-cluster={cluster.id} aria-hidden="true">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className={styles.cardTitle}>{card.title}</p>
                      <p className={styles.cardDesc}>{card.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
