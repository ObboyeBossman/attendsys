"use client";

/**
 * BrandLogo — Central SVG brand component for Attendsys.
 *
 * Renders the Attendsys icon (location-pin "a" with checkmark) directly
 * as an inline SVG so it scales perfectly, inherits colour via `color`,
 * and ships zero network requests.
 *
 * Usage:
 *   <BrandLogo />                     — default 32×32, monochrome black
 *   <BrandLogo size="sm" />           — 20px
 *   <BrandLogo size="md" />           — 32px  (default)
 *   <BrandLogo size="lg" />           — 48px
 *   <BrandLogo size="xl" />           — 64px
 *   <BrandLogo size={128} />          — arbitrary pixel value
 *   <BrandLogo color="#ef4444" />     — fill colour (defaults to currentColor)
 *   <BrandLogo withRing />            — wraps in a soft coloured ring for login cards
 *   <BrandLogo className="…" />       — pass-through className
 */

import React from "react";

// ── Size presets ────────────────────────────────────────────────────────────
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
  /** SVG fill colour. Defaults to currentColor so it inherits from CSS. */
  color?: string;
  /** Wrap the icon in a rounded ring (used on login card & transition overlay). */
  withRing?: boolean;
  /** Additional class names on the root element. */
  className?: string;
  /** Accessible label. Defaults to "Attendsys". Pass "" to mark decorative. */
  label?: string;
}

export function BrandLogo({
  size = "md",
  color = "currentColor",
  withRing = false,
  className = "",
  label = "Attendsys",
}: BrandLogoProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];

  const svg = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 500 500"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : "presentation"}
      aria-label={label || undefined}
      aria-hidden={!label || undefined}
      className={withRing ? undefined : className}
      style={{ display: "block", flexShrink: 0 }}
    >
      {label && <title>{label}</title>}

      {/*
        Paths traced from the provided brand PNG (transparent version).
        The icon is a location-pin "a" shape with a checkmark inside.
        Single compound path for crisp rendering at all sizes.
      */}

      {/* Outer arch — the "a" ascender + right stem */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M249 38
          C158 38 84 112 84 203
          C84 253 106 297 141 327
          L141 327
          L195 387
          C218 412 233 422 249 422
          C265 422 280 412 303 387
          L357 327
          C392 297 414 253 414 203
          C414 112 340 38 249 38
          Z
          M249 88
          C311 88 362 139 362 203
          C362 267 311 318 249 318
          C187 318 136 267 136 203
          C136 139 187 88 249 88
          Z
        "
      />

      {/* Shadow ellipse beneath pin */}
      <ellipse cx="249" cy="462" rx="68" ry="18" />

      {/* Checkmark inside the circular window */}
      <path
        d="M190 205 L232 248 L310 168"
        fill="none"
        stroke={color === "currentColor" ? "currentColor" : color}
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
        // Punch the checkmark out of the fill so it reads as white space
        // when the logo is rendered on a coloured background.
        // On transparent bg the svg fill IS the stroke colour so we invert.
        style={{ mixBlendMode: "normal" }}
      />
    </svg>
  );

  if (!withRing) return svg;

  // ── Ringed variant ───────────────────────────────────────────────────────
  const ringSize = px * 2;
  return (
    <div
      className={className}
      style={{
        width: ringSize,
        height: ringSize,
        borderRadius: "50%",
        background: "rgba(239,68,68,0.08)",
        border: "1.5px solid rgba(239,68,68,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {svg}
    </div>
  );
}

export default BrandLogo;
