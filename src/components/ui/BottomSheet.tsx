"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import styles from "./BottomSheet.module.css";

export interface BottomSheetProps {
  /** Controls visibility of the sheet */
  open: boolean;
  /** Callback invoked when the sheet should close */
  onClose: () => void;
  /** Sheet header title */
  title?: React.ReactNode;
  /** Optional subtitle or description text below title */
  description?: React.ReactNode;
  /** Main body content */
  children: React.ReactNode;
  /** Optional footer actions (e.g. action buttons) */
  footer?: React.ReactNode;
  /** Height size variant */
  size?: "sm" | "md" | "lg" | "auto";
  /** Adaptively render as a centered floating modal on tablet/desktop viewports (default: true) */
  desktopAsModal?: boolean;
  /** Allow closing by clicking the backdrop overlay (default: true) */
  closeOnBackdropClick?: boolean;
  /** Allow closing by pressing Escape key (default: true) */
  closeOnEscape?: boolean;
  /** Show top touch-drag handle indicator (default: true) */
  showHandle?: boolean;
  /** Custom wrapper class for the sheet dialog */
  className?: string;
  /** Custom class for the body scroll content area */
  bodyClassName?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "auto",
  desktopAsModal = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showHandle = true,
  className = "",
  bodyClassName = "",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  // Lock body scrolling while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard accessibility: Escape key to close
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Touch drag gestures for mobile swipe down
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta < 0) return; // Prevent pulling up beyond max-height
    dragCurrentY.current = delta;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "";
      sheetRef.current.style.transform = "";
    }
    // If dragged down past threshold (80px), trigger close
    if (dragCurrentY.current > 80) {
      onClose();
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [onClose]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    auto: styles.sizeAuto,
  }[size];

  const sheetClasses = [
    styles.sheet,
    open ? styles.sheetOpen : "",
    sizeClass,
    desktopAsModal ? styles.sheetDesktopModal : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const backdropClasses = [
    styles.backdrop,
    open ? styles.backdropOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleId = title ? "bottom-sheet-title" : undefined;
  const descriptionId = description ? "bottom-sheet-desc" : undefined;

  return (
    <>
      {/* Dimmed Backdrop Overlay */}
      <div
        className={backdropClasses}
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Sheet Dialog Surface */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={sheetClasses}
        tabIndex={-1}
      >
        {/* Top Drag Handle Zone */}
        {showHandle && (
          <div
            className={styles.handleZone}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            aria-hidden="true"
          >
            <div className={styles.handlePill} />
          </div>
        )}

        {/* Optional Header */}
        {(title || description) && (
          <div className={styles.header}>
            <div className={styles.headerText}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close sheet"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Body Content Area */}
        <div className={`${styles.body} ${bodyClassName}`}>{children}</div>

        {/* Optional Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
}
