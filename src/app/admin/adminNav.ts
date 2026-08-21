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
    label: "Users",
    href: "/admin/users",
    icon: "users",
  },
  {
    label: "Management",
    href: "/admin/management",
    icon: "management",
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
