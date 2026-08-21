"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import "../admin-light-theme.css";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          background: "#FAFAFA",
          position: "sticky",
          top: 0,
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
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "-0.015em",
          }}
        >
          Settings
        </span>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, padding: "0.5rem 1.25rem 2rem" }}>
        {children}
      </div>
    </div>
  );
}
