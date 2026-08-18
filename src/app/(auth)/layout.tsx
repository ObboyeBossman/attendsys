import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AttendSys",
  description: "Sign in to the AttendSys attendance management portal.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
