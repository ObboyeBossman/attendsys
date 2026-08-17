import type { Metadata } from "next";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { ADMIN_NAV_ITEMS } from "./adminNav";
import { AdminContentWrapper } from "./AdminContentWrapper";
import "./admin-light-theme.css";

export const metadata: Metadata = {
  title: { default: "Admin Portal", template: "%s | Admin | AttendSys" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout
      role="super_admin"
      roleLabel="Super Admin"
      navItems={ADMIN_NAV_ITEMS}
      homeUrl="/admin/dashboard"
    >
      <AdminContentWrapper>{children}</AdminContentWrapper>
    </PortalLayout>
  );
}
