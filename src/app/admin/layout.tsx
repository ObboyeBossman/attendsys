import type { Metadata } from "next";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminContentWrapper } from "./AdminContentWrapper";
import { NoticeBanner } from "@/components/layout/NoticeBanner";
import styles from "./admin.module.css";
import "./admin-light-theme.css";

export const metadata: Metadata = {
  title: { default: "Admin Portal", template: "%s | Admin | Attendsys" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminRoot} data-portal="admin-light">
      <AdminSidebar />
      <main className={styles.adminMain}>
        <div className={styles.adminNoticeBannerBar}>
          <NoticeBanner />
        </div>
        <AdminContentWrapper>{children}</AdminContentWrapper>
      </main>
    </div>
  );
}
