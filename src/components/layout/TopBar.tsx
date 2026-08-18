"use client";

import React, { useState } from "react";
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
}

const DEFAULT_TABS: TopBarTab[] = [
  { id: "today", label: "Today" },
  { id: "calendar", label: "Calendar" },
];

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="6" x2="19" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </svg>
  );
}

export function TopBar({
  tabs = DEFAULT_TABS,
  activeTab: controlledActiveTab,
  onChangeTab,
  onMenuPress,
  onProfilePress,
  userInitial = "AB",
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

  return (
    <header className={styles.topbar}>
      {/* Left — menu */}
      <button
        onClick={onMenuPress}
        aria-label="Open menu"
        className={styles.menuBtn}
      >
        <MenuIcon />
      </button>

      {/* Center — tabs */}
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
