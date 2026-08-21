"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

const TITLES: Record<string, string> = {
  "/admin/management": "Management",
  "/admin/settings":   "Settings",
};

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const title    = TITLES[pathname] ?? "";

  return (
    <div
      style={{
        minHeight:  "100dvh",
        background: "var(--color-canvas)",
        display:    "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — X button + title on same line */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        "var(--space-3)",
          padding:    "0.875rem var(--space-5)",
          position:   "sticky",
          top:        0,
          background: "var(--color-canvas)",
          zIndex:     "var(--z-sticky)",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            width:           "44px",
            height:          "44px",
            borderRadius:    "var(--radius-full)",
            background:      "var(--color-surface-3)",
            border:          "none",
            cursor:          "pointer",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            color:           "var(--color-text-primary)",
            flexShrink:      0,
          }}
        >
          <X size={22} strokeWidth={2} />
        </button>

        {title && (
          <span
            style={{
              fontSize:      "var(--text-lg)",
              fontWeight:    "var(--font-bold)",
              color:         "var(--color-text-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Page content */}
      <div style={{ flex: 1, padding: "var(--space-2) var(--space-5) var(--space-8)" }}>
        {children}
      </div>
    </div>
  );
}
