"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, ShieldAlert, KeyRound, LogOut, Loader2 } from "lucide-react";
import { getUserLoginHistory, type LoginAttemptItem } from "@/actions/audit";
import styles from "./LoginHistoryModal.module.css";

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

function formatFullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GH", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function getActionInfo(action: string, newData?: Record<string, unknown> | null) {
  switch (action) {
    case "user.login":
      return {
        label: "Successful Sign In",
        badge: "Success",
        styleClass: styles.kindSuccess,
        icon: <CheckCircle2 size={16} strokeWidth={2} />,
      };
    case "user.login_failed":
      const attempts = newData?.failed_attempts ? ` (${newData.failed_attempts} failed)` : "";
      return {
        label: `Failed Login Attempt${attempts}`,
        badge: "Failed",
        styleClass: styles.kindFailed,
        icon: <AlertTriangle size={16} strokeWidth={2} />,
      };
    case "user.account_locked":
      return {
        label: "Account Temporarily Locked",
        badge: "Locked",
        styleClass: styles.kindFailed,
        icon: <ShieldAlert size={16} strokeWidth={2} />,
      };
    case "user.password_changed":
      return {
        label: "Password Updated",
        badge: "Password",
        styleClass: styles.kindWarning,
        icon: <KeyRound size={16} strokeWidth={2} />,
      };
    case "user.logout":
      return {
        label: "Signed Out",
        badge: "Logout",
        styleClass: styles.kindNeutral,
        icon: <LogOut size={16} strokeWidth={2} />,
      };
    default:
      return {
        label: action,
        badge: "Activity",
        styleClass: styles.kindNeutral,
        icon: <CheckCircle2 size={16} strokeWidth={2} />,
      };
  }
}

export function LoginHistoryModal({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  userRole,
}: LoginHistoryModalProps) {
  const [logs, setLogs] = useState<LoginAttemptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    setError(null);

    getUserLoginHistory(userId).then((res) => {
      setLoading(false);
      if ("error" in res) {
        setError(res.error);
      } else {
        setLogs(res.logs);
      }
    });
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>Login History</h3>
            <p className={styles.subtitle}>
              {userName} {userEmail ? `(${userEmail})` : ""} {userRole ? `· ${userRole}` : ""}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2 size={18} className="spin" />
              Loading history…
            </div>
          ) : error ? (
            <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className={styles.emptyState}>
              No recent login attempts or auth activity recorded for this user.
            </div>
          ) : (
            <div className={styles.timeline}>
              {logs.map((log) => {
                const info = getActionInfo(log.action, log.newData);
                return (
                  <div key={log.id} className={styles.item}>
                    <div className={`${styles.itemIcon} ${info.styleClass}`}>
                      {info.icon}
                    </div>
                    <div className={styles.itemContent}>
                      <span className={styles.itemLabel}>{info.label}</span>
                      <span className={styles.itemMeta}>
                        {formatFullTime(log.createdAt)}
                      </span>
                    </div>
                    <div className={styles.itemTime}>
                      {formatRelativeTime(log.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
