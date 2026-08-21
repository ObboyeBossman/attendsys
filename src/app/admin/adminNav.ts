import { NavItem } from "@/components/layout/PortalLayout";

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Monitor",
    href: "/admin/monitor",
    icon: "monitor",
  },
  {
    label: "Institution",
    href: "/admin/institution",
    icon: "institution",
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
    href: "/admin/users",
    icon: "users",
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
