"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import styles from "./TopBar.module.css";

export type TopBarTabId = "live" | "oversight" | "today" | "calendar" | string;

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
  { id: "live", label: "Live" },
  { id: "oversight", label: "Oversight" },
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
    tabs[0]?.id || "live"
  );
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  // ── Elastic indicator state ───────────────────────────────────────────
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  // isDraggingRef is the source-of-truth for event-handler guards (avoids stale-closure bugs).
  // isDragging (state) is derived from it solely for render-time style decisions.
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerWidth = useRef(0);

  const tabList = Array.from(tabs);
  const activeIndex = tabList.findIndex((t) => t.id === activeTab);

  // Measure the active tab label element and set indicator position
  const measureIndicator = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
    if (containerRef.current) {
      containerWidth.current = containerRef.current.offsetWidth;
    }
  }, [activeTab]);

  useEffect(() => {
    measureIndicator();
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 420);
    return () => clearTimeout(t);
  }, [activeTab, measureIndicator]);

  useEffect(() => {
    measureIndicator();
    window.addEventListener("resize", measureIndicator);
    return () => window.removeEventListener("resize", measureIndicator);
  }, [measureIndicator]);

  // ── Sync internal tab state when page-body swipe fires topbar-tab-change ──
  // The page content reel (usePageSwipe) dispatches this same event so the
  // TopBar indicator follows. But the TopBar also needs to update its OWN
  // active-tab state so the tab button labels switch too — without this the
  // indicator slides but the "Live" label stays highlighted after swiping.
  useEffect(() => {
    if (controlledActiveTab !== undefined) return; // skip if fully controlled
    function onExternalTabChange(e: Event) {
      const tabId = (e as CustomEvent<{ tabId: string }>).detail?.tabId as TopBarTabId | undefined;
      if (!tabId) return;
      // Only update if the tab is in our list and isn't already active
      const exists = tabList.some((t) => t.id === tabId);
      if (exists) {
        setInternalActiveTab(tabId);
      }
    }
    window.addEventListener("topbar-tab-change", onExternalTabChange);
    return () => window.removeEventListener("topbar-tab-change", onExternalTabChange);
  // tabList is derived from tabs prop — stable reference is fine here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledActiveTab, tabs]);

  // ── Tab switching ─────────────────────────────────────────────────────
  const handleTabClick = (tabId: TopBarTabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChangeTab?.(tabId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("topbar-tab-change", { detail: { tabId } })
      );
    }
  };

  // ── Drag / swipe handlers ─────────────────────────────────────────────
  const handleStart = (clientX: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startX.current = clientX;
    currentX.current = clientX;
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    currentX.current = clientX;
    const diff = clientX - startX.current;
    // Rubber-band at boundaries
    if (
      (activeIndex === 0 && diff > 0) ||
      (activeIndex === tabList.length - 1 && diff < 0)
    ) {
      setDragOffset(diff * 0.2);
    } else {
      setDragOffset(diff);
    }
    // Emit progress so content reels can follow in real time
    const w = containerWidth.current || 1;
    window.dispatchEvent(
      new CustomEvent("topbar-drag-progress", {
        detail: { dragOffset: diff, containerWidth: w, activeIndex },
      })
    );
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const diff = currentX.current - startX.current;
    const threshold = 45;
    if (diff < -threshold && activeIndex < tabList.length - 1) {
      handleTabClick(tabList[activeIndex + 1].id);
    } else if (diff > threshold && activeIndex > 0) {
      handleTabClick(tabList[activeIndex - 1].id);
    }
    setDragOffset(0);
    window.dispatchEvent(
      new CustomEvent("topbar-drag-progress", {
        detail: { dragOffset: 0, containerWidth: containerWidth.current, activeIndex },
      })
    );
  };

  // ── Liquid indicator geometry ─────────────────────────────────────────
  let liveLeft = indicatorStyle.left;
  let liveWidth = indicatorStyle.width;
  const w = containerWidth.current || 1;

  if (isDragging && w > 0 && tabList.length > 1) {
    const dragRatio = dragOffset / w;
    const targetIndex = dragRatio < 0 ? activeIndex + 1 : activeIndex - 1;

    if (targetIndex >= 0 && targetIndex < tabList.length) {
      const curEl = tabRefs.current[tabList[activeIndex].id];
      const tgtEl = tabRefs.current[tabList[targetIndex].id];

      if (curEl && tgtEl) {
        const progress = Math.min(Math.abs(dragRatio), 1);
        const stretch = Math.sin(progress * Math.PI) * 14;
        const baseW =
          curEl.offsetWidth +
          (tgtEl.offsetWidth - curEl.offsetWidth) * progress;
        liveWidth = baseW + stretch;
        if (dragRatio < 0) {
          liveLeft =
            curEl.offsetLeft +
            (tgtEl.offsetLeft - curEl.offsetLeft) * progress;
        } else {
          liveLeft =
            curEl.offsetLeft -
            (curEl.offsetLeft - tgtEl.offsetLeft) * progress;
        }
      }
    } else {
      // Boundary rubber-band stretch
      liveWidth = indicatorStyle.width + Math.abs(dragOffset * 0.12);
      liveLeft =
        dragOffset > 0
          ? indicatorStyle.left - Math.abs(dragOffset * 0.12)
          : indicatorStyle.left;
    }
  }

  const hasTabs = tabList.length > 0;

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

      {/* Center — elastic tab bar OR brand title */}
      {hasTabs ? (
        <div
          ref={containerRef}
          className={styles.tabsContainer}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => { if (isDraggingRef.current) handleMove(e.clientX); }}
          onMouseUp={handleEnd}
          onMouseLeave={() => { if (isDraggingRef.current) handleEnd(); }}
        >
          <div className={styles.tabRow}>
            {tabList.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  ref={(el) => { tabRefs.current[id] = el; }}
                  onClick={() => handleTabClick(id)}
                  className={styles.tabBtn}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span
                    className={`${styles.tabLabel} ${
                      isActive ? styles.tabLabelActive : styles.tabLabelInactive
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}

            {/* Elastic liquid underline indicator */}
            <div
              className={`${styles.indicator} ${isAnimating ? styles.indicatorPulse : ""}`}
              style={{
                left: `${liveLeft}px`,
                width: `${liveWidth}px`,
                transformOrigin: dragOffset < 0 ? "left center" : "right center",
                transition: isDragging
                  ? "none"
                  : "left 380ms cubic-bezier(0.34, 1.3, 0.64, 1), width 360ms cubic-bezier(0.34, 1.4, 0.64, 1), transform 200ms ease",
              }}
            />
          </div>
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
