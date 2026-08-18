import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to AttendSys to access your portal.",
};

export default function LoginPage() {
  return <LoginClient />;
}
