"use client";

/**
 * BrandLogo — Central PNG brand component for AttendSys.
 *
 * Uses next/image to serve the real logo PNG with proper optimisation.
 * The source PNG (/icons/icon-512.png) is transparent and renders correctly
 * on both light and dark surfaces.
 *
 * Usage:
 *   <BrandLogo />                  — default 32×32
 *   <BrandLogo size="sm" />        — 20px
 *   <BrandLogo size="md" />        — 32px  (default)
 *   <BrandLogo size="lg" />        — 48px
 *   <BrandLogo size="xl" />        — 64px
 *   <BrandLogo size={128} />       — arbitrary pixel value
 *   <BrandLogo withRing />         — wraps in a soft coloured ring (login card / overlay)
 *   <BrandLogo className="…" />    — pass-through className on the root element
 *   <BrandLogo label="" />         — marks as decorative (aria-hidden)
 */

import Image from "next/image";

// ── Size presets ─────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm:  20,
  md:  32,
  lg:  48,
  xl:  64,
} as const;

type SizePreset = keyof typeof SIZE_MAP;

export interface BrandLogoProps {
  /** Preset or explicit pixel size. Default: "md" (32px). */
  size?: SizePreset | number;
  /** Wrap in a soft red ring — used on login card and transition overlay. */
  withRing?: boolean;
  /** Extra className applied to the outermost element. */
  className?: string;
  /**
   * Accessible alt text. Defaults to "AttendSys".
   * Pass an empty string "" to mark the image as decorative (aria-hidden).
   */
  label?: string;
}

export function BrandLogo({
  size = "md",
  withRing = false,
  className = "",
  label = "AttendSys",
}: BrandLogoProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];

  const img = (
    <Image
      src="/icons/icon-512.png"
      alt={label}
      width={px}
      height={px}
      aria-hidden={label === "" ? true : undefined}
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
    />
  );

  if (!withRing) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", flexShrink: 0 }}
      >
        {img}
      </span>
    );
  }

  // ── Ringed variant ────────────────────────────────────────────────────────
  const ringSize = px * 2;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: ringSize,
        height: ringSize,
        borderRadius: "50%",
        background: "rgba(239,68,68,0.08)",
        border: "1.5px solid rgba(239,68,68,0.18)",
        flexShrink: 0,
      }}
    >
      {img}
    </span>
  );
}

export default BrandLogo;
