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
    // "default" keeps a light status bar with dark icons — avoids any red/translucent flash
    statusBarStyle: "default",
    title: "AttendSys",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  // Force white status-bar / OS chrome on every first paint (light + dark media)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  colorScheme: "light",
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
    // Inline white background guarantees the browser never samples a red
    // or dark color for the status bar before CSS arrives.
    <html
      lang="en"
      className={`${hanken.variable} ${jetbrains.variable}`}
      data-scroll-behavior="smooth"
      style={{ backgroundColor: "#ffffff" }}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body style={{ backgroundColor: "#ffffff" }}>
        <NavigationProgressProvider>
          <NavProgressBar />
          {children}
        </NavigationProgressProvider>
      </body>
    </html>
  );
}

