"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

const TITLES: Record<string, string> = {
  "/admin/management": "Management",
  "/admin/settings": "Settings",
};

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — X button + title on same line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1.25rem",
          position: "sticky",
          top: 0,
          background: "#FAFAFA",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#EFEFEF",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111827",
            flexShrink: 0,
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        {title && (
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#111827",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Page content */}
      <div style={{ flex: 1, padding: "0.5rem 1.25rem 2rem" }}>
        {children}
      </div>
    </div>
  );
}
