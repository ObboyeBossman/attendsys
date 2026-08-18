"use client";

/**
 * FullscreenLoader — Pure global reusable loading overlay
 *
 * Uses React createPortal directly onto document.body with z-index: 999999 to guarantee
 * that when active, it completely covers all headers, footers, and content.
 * Renders ONLY the circular progress indicator and stage status message.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./FullscreenLoader.module.css";

interface FullscreenLoaderProps {
  visible?: boolean;
  message?: string;
}

export function FullscreenLoader({
  visible = true,
  message = "Loading…",
}: FullscreenLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!visible || !mounted) return null;

  const overlayContent = (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className={styles.container}>
        {/* Monochromatic Circular Progress Indicator */}
        <div className={styles.spinnerWrap}>
          <svg className={styles.spinnerSvg} viewBox="0 0 50 50">
            <circle className={styles.spinnerTrack} cx="25" cy="25" r="20" />
            <circle className={styles.spinnerHead} cx="25" cy="25" r="20" />
          </svg>
        </div>

        <div className={styles.textWrap}>
          <h2 className={styles.message}>{message}</h2>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}

// ── Global Context & Hook ──────────────────────────────────────────────────

interface FullscreenLoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  setMessage: (message: string) => void;
}

const FullscreenLoaderContext = createContext<FullscreenLoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
  setMessage: () => {},
});

export function useFullscreenLoader() {
  return useContext(FullscreenLoaderContext);
}

export function FullscreenLoaderProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessageState] = useState("Loading…");

  const showLoader = useCallback((msg?: string) => {
    if (msg) setMessageState(msg);
    setVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    setVisible(false);
  }, []);

  const setMessage = useCallback((msg: string) => {
    setMessageState(msg);
  }, []);

  return (
    <FullscreenLoaderContext.Provider value={{ showLoader, hideLoader, setMessage }}>
      {children}
      <FullscreenLoader visible={visible} message={message} />
    </FullscreenLoaderContext.Provider>
  );
}
