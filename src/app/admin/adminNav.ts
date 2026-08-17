import { NavItem } from "@/components/layout/PortalLayout";

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Institution",
    href: "/admin/institution/faculties",
    icon: "institution",
    children: [
      { label: "Faculties", href: "/admin/institution/faculties" },
      { label: "Departments", href: "/admin/institution/departments" },
      { label: "Programmes", href: "/admin/institution/programmes" },
      { label: "Qual. Types", href: "/admin/institution/qualification-types" },
      { label: "Levels", href: "/admin/institution/levels" },
    ],
  },
  {
    label: "Academic Years",
    href: "/admin/academic-years",
    icon: "academic",
  },
  {
    label: "Semesters",
    href: "/admin/semesters",
    icon: "semesters",
  },
  {
    label: "Groups",
    href: "/admin/groups",
    icon: "groups",
  },
  {
    label: "Users",
    href: "/admin/users/students",
    icon: "users",
    children: [
      { label: "Students", href: "/admin/users/students" },
      { label: "Lecturers", href: "/admin/users/lecturers" },
      { label: "Super Admins", href: "/admin/users/admins" },
    ],
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: "courses",
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: "audit",
  },
  {
    label: "Feedback",
    href: "/admin/feedback",
    icon: "feedback",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
  },
] as const;
