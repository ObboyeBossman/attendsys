import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to AttendSys to access your portal.",
};

/**
 * SFR-AUTH-10 — Read the device trust cookie server-side and pass
 * remembered identity to the client for pre-fill / "Welcome back" UX.
 */
export default async function LoginPage() {
  let rememberedEmail = "";
  let rememberedName = "";

  try {
    const cookieStore = await cookies();
    const deviceCookie = cookieStore.get("atsd_device");
    if (deviceCookie?.value) {
      const payload = JSON.parse(
        Buffer.from(deviceCookie.value, "base64").toString("utf-8")
      );
      if (typeof payload?.email === "string") rememberedEmail = payload.email;
      if (typeof payload?.name === "string") rememberedName = payload.name;
    }
  } catch {
    // Malformed cookie — silently ignore, show empty form
  }

  return (
    <LoginClient
      rememberedEmail={rememberedEmail}
      rememberedName={rememberedName}
    />
  );
}
