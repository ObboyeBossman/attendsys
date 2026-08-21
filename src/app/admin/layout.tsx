import type { Metadata } from "next";
import { AdminShell } from "./AdminShell";
import "./admin-light-theme.css";

export const metadata: Metadata = {
  title: { default: "Admin Portal", template: "%s | Admin | AttendSys" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
