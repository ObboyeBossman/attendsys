"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, CheckCircle } from "lucide-react";
import type { DisputeItem } from "./page";
import styles from "./DisputeSheet.module.css";

/* ── Helpers ────────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ── Props ──────────────────────────────────────────────────────────────── */

interface DisputeSheetProps {
  open: boolean;
  onClose: () => void;
  disputes: DisputeItem[];
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function DisputeSheet({ open, onClose, disputes }: DisputeSheetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset expanded card when sheet closes
  useEffect(() => {
    if (!open) setExpandedId(null);
  }, [open]);

  const toggleCard = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const statusClass = (status: DisputeItem["currentStatus"]) => {
    if (status === "present") return styles.statusPresent;
    if (status === "late") return styles.statusLate;
    return styles.statusAbsent;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pending disputes"
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
      >
        {/* Handle */}
        <div className={styles.handle} aria-hidden="true">
          <div className={styles.handleBar} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Pending Disputes</h2>
            {disputes.length > 0 && (
              <span className={styles.badge}>{disputes.length}</span>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close disputes"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {disputes.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle
                size={28}
                strokeWidth={1.75}
                className={styles.emptyIcon}
              />
              <p className={styles.emptyTitle}>No pending disputes</p>
              <p className={styles.emptySub}>All disputes have been resolved.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {disputes.map((dispute) => {
                const isOpen = expandedId === dispute.id;
                return (
                  <div
                    key={dispute.id}
                    className={`${styles.disputeCard} ${isOpen ? styles.disputeCardOpen : ""}`}
                  >
                    {/* Collapsed summary row */}
                    <button
                      className={styles.cardSummary}
                      onClick={() => toggleCard(dispute.id)}
                      aria-expanded={isOpen}
                      aria-controls={`dispute-detail-${dispute.id}`}
                    >
                      <div className={styles.summaryLeft}>
                        <div className={styles.accentLine} aria-hidden="true" />
                        <div className={styles.summaryMeta}>
                          <div className={styles.summaryStudent}>
                            {dispute.studentName}
                            <span className={styles.summaryIndex}>
                              {" "}· {dispute.indexNumber}
                            </span>
                          </div>
                          <div className={styles.summaryCourse}>
                            {dispute.courseName}
                            {dispute.courseCode && ` · ${dispute.courseCode}`}
                          </div>
                        </div>
                      </div>
                      <div className={styles.summaryRight}>
                        <span className={styles.timeAgo}>{timeAgo(dispute.raised_at)}</span>
                        <ChevronDown
                          size={16}
                          strokeWidth={1.75}
                          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div
                        id={`dispute-detail-${dispute.id}`}
                        className={styles.detail}
                        role="region"
                        aria-label={`Details for ${dispute.studentName}`}
                      >
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Session date</span>
                          <span className={styles.detailValue}>{fmtDate(dispute.sessionDate)}</span>
                        </div>

                        <div className={styles.detailDivider} />

                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Recorded as</span>
                          <span className={`${styles.statusChip} ${statusClass(dispute.currentStatus)}`}>
                            {dispute.currentStatus ?? "Unknown"}
                          </span>
                        </div>

                        <div className={styles.detailDivider} />

                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Reason</span>
                          <span className={styles.reasonText}>{dispute.reason}</span>
                        </div>

                        <div className={styles.detailDivider} />

                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Raised</span>
                          <span className={styles.detailValue}>{fmtDate(dispute.raised_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
