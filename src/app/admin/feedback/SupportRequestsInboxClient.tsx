"use client";

import { useState, useTransition } from "react";
import { Mail, GraduationCap, BookOpen } from "lucide-react";
import type { SupportRequestItem } from "@/actions/support-requests";
import { markSupportRequestRead } from "@/actions/support-requests";
import styles from "./FeedbackInbox.module.css";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return d.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

// ── Main component ─────────────────────────────────────────────────────────────

type SRFilter = "all" | "unread" | "student" | "lecturer";

export function SupportRequestsInboxClient({
  items: initialItems,
}: {
  items: SupportRequestItem[];
}) {
  const [items, setItems]     = useState(initialItems);
  const [filter, setFilter]   = useState<SRFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition]   = useTransition();

  const filtered = items.filter((r) => {
    if (filter === "all")      return true;
    if (filter === "unread")   return !r.isReadAdmin;
    return r.role === filter;
  });

  const unreadCount = items.filter((r) => !r.isReadAdmin).length;

  function handleExpand(id: string) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    const item = items.find((r) => r.id === id);
    if (next && item && !item.isReadAdmin) {
      startTransition(async () => {
        await markSupportRequestRead(id);
        setItems((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isReadAdmin: true } : r))
        );
      });
    }
  }

  const FILTERS: { key: SRFilter; label: string }[] = [
    { key: "all",      label: `All (${items.length})` },
    { key: "unread",   label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "student",  label: "Students" },
    { key: "lecturer", label: "Lecturers" },
  ];

  return (
    <div>
      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.filterBtn} ${filter === key ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── List ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <rect x="5" y="8" width="30" height="24" rx="3" />
            <path d="M5 14l15 10 15-10" />
          </svg>
          <p>No support requests match this filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.map((item, idx) => {
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                className={`${styles.row} ${!item.isReadAdmin ? styles.rowUnread : ""}`}
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                {/* ── Collapsed header ─────────────────────────── */}
                <button
                  className={styles.rowHeader}
                  onClick={() => handleExpand(item.id)}
                  aria-expanded={isOpen}
                >
                  {/* Unread dot */}
                  <span
                    className={styles.unreadDot}
                    style={{ opacity: item.isReadAdmin ? 0 : 1 }}
                    aria-label={item.isReadAdmin ? "" : "Unread"}
                  />

                  {/* Role icon */}
                  <span
                    className={styles.sentimentEmoji}
                    title={item.role === "student" ? "Student" : "Lecturer"}
                    style={{ fontSize: 16, display: "flex", alignItems: "center" }}
                  >
                    {item.role === "student"
                      ? <GraduationCap size={20} strokeWidth={1.75} style={{ color: "var(--color-info)" }} />
                      : <BookOpen size={20} strokeWidth={1.75} style={{ color: "var(--color-primary)" }} />
                    }
                  </span>

                  {/* Subject + meta */}
                  <div className={styles.rowMeta}>
                    <span className={styles.rowTitle}>{item.subject}</span>
                    <span className={styles.rowSub}>
                      <span className={styles.roleBadge} data-role={item.role}>
                        {item.role === "student" ? "Student" : "Lecturer"}
                      </span>
                      · {item.email} · {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* Envelope icon */}
                  <Mail
                    size={15}
                    strokeWidth={1.75}
                    style={{ flexShrink: 0, color: "var(--color-text-3)" }}
                    aria-hidden="true"
                  />

                  {/* Chevron */}
                  <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    width="16" height="16" viewBox="0 0 16 16"
                    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>

                {/* ── Expanded body ─────────────────────────────── */}
                {isOpen && (
                  <div className={styles.rowBody}>
                    <div className={styles.bodySection}>
                      <span className={styles.bodyLabel}>Message</span>
                      <p className={styles.bodyText}>{item.message}</p>
                    </div>
                    <div className={styles.bodyMeta}>
                      <span>
                        From: <strong>{item.email}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Submitted{" "}
                        {new Date(item.createdAt).toLocaleString("en-GH", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
