import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationProgressProvider } from "@/components/layout/NavigationProgress";
import { NavProgressBar } from "@/components/layout/PageTransition";

// Google Fonts loaded via CSS @import in globals.css instead of next/font
// to avoid build-time network fetches in restricted environments.
const hanken = { variable: "" };
const jetbrains = { variable: "" };

export const metadata: Metadata = {
  title: {
    default: "AttendSys",
    template: "%s | AttendSys",
  },
  description:
    "University Attendance Management System — track, verify, and manage student attendance digitally.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AttendSys",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hanken.variable} ${jetbrains.variable}`} data-scroll-behavior="smooth">
      <head>
        {/* Inline theme-color — parsed by the OS before JS hydration to prevent status bar flash */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <NavigationProgressProvider>
          <NavProgressBar />
          {children}
        </NavigationProgressProvider>
      </body>
    </html>
  );
}
