"use client";

import { useRef, useCallback, useEffect } from "react";

export interface UsePageSwipeOptions {
  /** Zero-based index of the currently active tab */
  activeIndex: number;
  /** Total number of tabs */
  tabCount: number;
  /** IDs of tabs in order (index matches activeIndex) */
  tabIds: readonly string[];
  /**
   * Called when the swipe threshold is crossed and a tab change is requested.
   * The caller is responsible for also dispatching `topbar-tab-change` so the
   * TopBar indicator stays in sync — this hook does it automatically.
   */
  onTabChange: (tabId: string) => void;
  /**
   * Minimum px the user must swipe horizontally before we commit to treating
   * this gesture as a swipe (avoids fighting with vertical scroll).
   * Default: 10
   */
  intentThreshold?: number;
  /**
   * px threshold that must be crossed to trigger a tab change on release.
   * Default: 72
   */
  swipeThreshold?: number;
  /**
   * Rubber-band factor applied at the first/last tab boundary (0–1).
   * Default: 0.18
   */
  rubberBandFactor?: number;
}

export interface UsePageSwipeReturn {
  /** Attach this ref to the scrollable content container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Whether a swipe is currently in progress */
  isDragging: boolean;
  /** Raw horizontal drag offset in px (negative = swiping left → next tab) */
  dragOffset: number;
}

/**
 * usePageSwipe
 *
 * Adds horizontal swipe-to-change-tab behaviour to the page body (content
 * area), mirroring exactly what the TopBar does internally.  Both sources
 * dispatch the same `topbar-drag-progress` and `topbar-tab-change` custom
 * events so the TopBar liquid indicator and the content reel stay perfectly
 * synchronised regardless of which surface initiated the gesture.
 *
 * Vertical scrolling is fully preserved: the hook does not capture the event
 * until the gesture is clearly more horizontal than vertical.
 */
export function usePageSwipe({
  activeIndex,
  tabCount,
  tabIds,
  onTabChange,
  intentThreshold = 10,
  swipeThreshold = 72,
  rubberBandFactor = 0.18,
}: UsePageSwipeOptions): UsePageSwipeReturn {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for synchronous access inside passive event handlers
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const intentLockedRef = useRef<"horizontal" | "vertical" | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const activeIndexRef = useRef(activeIndex);

  // Keep active index ref in sync (avoids stale closure in event handlers)
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // We need a way to trigger re-renders in the consuming component.
  // Instead of storing state here (which would cause hook re-renders), we
  // dispatch the same `topbar-drag-progress` event.  The consuming component
  // already listens to that event to update its own drag state, so this keeps
  // the single source of truth in the component while the hook stays stateless.

  const dispatchProgress = useCallback(
    (offset: number) => {
      const w = containerRef.current?.offsetWidth ?? 1;
      window.dispatchEvent(
        new CustomEvent("topbar-drag-progress", {
          detail: {
            dragOffset: offset,
            containerWidth: w,
            activeIndex: activeIndexRef.current,
          },
        })
      );
    },
    []
  );

  const dispatchTabChange = useCallback(
    (tabId: string) => {
      window.dispatchEvent(
        new CustomEvent("topbar-tab-change", { detail: { tabId } })
      );
      onTabChange(tabId);
    },
    [onTabChange]
  );

  const handleStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = false; // will be set true once intent is confirmed
    dragOffsetRef.current = 0;
    intentLockedRef.current = null;
    startXRef.current = clientX;
    startYRef.current = clientY;
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number, preventDefault: () => void) => {
      const dx = clientX - startXRef.current;
      const dy = clientY - startYRef.current;

      // Determine gesture intent on first substantial movement
      if (intentLockedRef.current === null) {
        if (Math.abs(dx) < intentThreshold && Math.abs(dy) < intentThreshold) {
          return; // not moved enough yet
        }
        intentLockedRef.current =
          Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
      }

      // Bail out immediately for vertical gestures — let the browser scroll
      if (intentLockedRef.current === "vertical") return;

      // Horizontal swipe confirmed
      preventDefault();
      isDraggingRef.current = true;

      const curIdx = activeIndexRef.current;
      let offset = dx;

      // Rubber-band at boundaries
      if ((curIdx === 0 && dx > 0) || (curIdx === tabCount - 1 && dx < 0)) {
        offset = dx * rubberBandFactor;
      }

      dragOffsetRef.current = offset;
      dispatchProgress(offset);
    },
    [intentThreshold, tabCount, rubberBandFactor, dispatchProgress]
  );

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) {
      // Gesture was vertical or not started — reset quietly
      intentLockedRef.current = null;
      return;
    }

    isDraggingRef.current = false;
    intentLockedRef.current = null;

    const offset = dragOffsetRef.current;
    dragOffsetRef.current = 0;

    // Dispatch progress=0 so reel snaps back / forward
    dispatchProgress(0);

    const curIdx = activeIndexRef.current;

    if (offset < -swipeThreshold && curIdx < tabCount - 1) {
      // Swiped left → advance to next tab
      dispatchTabChange(tabIds[curIdx + 1]);
    } else if (offset > swipeThreshold && curIdx > 0) {
      // Swiped right → go back to previous tab
      dispatchTabChange(tabIds[curIdx - 1]);
    }
  }, [swipeThreshold, tabCount, tabIds, dispatchProgress, dispatchTabChange]);

  // ── Attach event listeners to the container ─────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Touch handlers (passive:false needed so we can preventDefault on horizontal swipes)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY, () =>
        e.preventDefault()
      );
    };
    const onTouchEnd = () => handleEnd();
    const onTouchCancel = () => {
      isDraggingRef.current = false;
      intentLockedRef.current = null;
      dragOffsetRef.current = 0;
      dispatchProgress(0);
    };

    // Mouse handlers (desktop drag-to-switch)
    const onMouseDown = (e: MouseEvent) => {
      // Only primary button
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!startXRef.current && !startYRef.current) return;
      handleMove(e.clientX, e.clientY, () => e.preventDefault());
    };
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => {
      if (isDraggingRef.current) handleEnd();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [handleStart, handleMove, handleEnd, dispatchProgress]);

  // Return values are informational only; the real sync happens via events.
  // Consumers use reelRef + topbar-drag-progress to drive visual state,
  // so we don't need to surface isDragging/dragOffset as React state here.
  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isDragging: false, // not used by consumers — kept for API completeness
    dragOffset: 0,
  };
}
