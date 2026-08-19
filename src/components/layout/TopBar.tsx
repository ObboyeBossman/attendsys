"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import styles from "./TopBar.module.css";

export type TopBarTabId = "today" | "calendar" | string;

export interface TopBarTab {
  id: TopBarTabId;
  label: string;
}

export interface TopBarProps {
  tabs?: readonly TopBarTab[];
  activeTab?: TopBarTabId;
  onChangeTab?: (tabId: TopBarTabId) => void;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  userInitial?: string;
  title?: string;
}

const DEFAULT_TABS: TopBarTab[] = [
  { id: "today", label: "Today" },
  { id: "calendar", label: "Calendar" },
];

export function TopBar({
  tabs = DEFAULT_TABS,
  activeTab: controlledActiveTab,
  onChangeTab,
  onMenuPress,
  onProfilePress,
  userInitial = "AB",
  title = "Dashboard",
}: TopBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<TopBarTabId>(
    tabs[0]?.id || "today"
  );
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: TopBarTabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChangeTab?.(tabId);
    // Dispatch a custom event so dashboard client components can react
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("topbar-tab-change", { detail: { tabId } })
      );
    }
  };

  const hasTabs = tabs && tabs.length > 0;

  return (
    <header className={styles.topbar}>
      {/* Left — menu button */}
      <button
        onClick={onMenuPress}
        aria-label="Open menu"
        className={styles.menuBtn}
      >
        <Menu size={22} strokeWidth={1.75} />
      </button>

      {/* Center — tabs (dashboard) or brand title by default (non-dashboard) */}
      {hasTabs ? (
        <div className={styles.tabsContainer}>
          {tabs.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={styles.tabBtn}
              >
                <span
                  className={`${styles.tabLabel} ${
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive
                  }`}
                >
                  {label}
                </span>

                {/* Active underline */}
                <span
                  className={styles.activeUnderline}
                  style={{
                    width: isActive ? "100%" : "0%",
                  }}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.brandTitle}>{title}</div>
      )}

      {/* Right — profile avatar */}
      <button
        onClick={onProfilePress}
        aria-label="Profile"
        className={styles.profileBtn}
      >
        <div className={styles.profileAvatar}>{userInitial}</div>
      </button>
    </header>
  );
}
