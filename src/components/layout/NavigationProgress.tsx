"use client";

/**
 * NavigationProgress — global route-change detection
 *
 * Intercepts all link clicks, button navigation, and programmatic router pushes
 * to instantly trigger PageShimmer and NavProgressBar on user action.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

interface NavigationState {
  navigating: boolean;
  targetHref: string | null;
  startNavigation: (href: string) => void;
  stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationState>({
  navigating: false,
  targetHref: null,
  startNavigation: () => {},
  stopNavigation: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [state, setState] = useState<{ navigating: boolean; targetHref: string | null }>({
    navigating: false,
    targetHref: null,
  });

  const prevPathname = useRef(pathname);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startNavigation = useCallback((href: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState({ navigating: true, targetHref: href });
  }, []);

  const stopNavigation = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState({ navigating: false, targetHref: null });
  }, []);

  // Intercept clicks on links and buttons with navigation targets
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [data-href]");
      if (!clickable) return;

      const href =
        clickable.getAttribute("href") ||
        clickable.getAttribute("data-href");
      if (!href) return;

      // Only internal navigation
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        clickable.getAttribute("target") !== "_blank" &&
        !clickable.hasAttribute("download");

      if (!isInternal) return;

      // Same-page hash links — skip
      if (href.split("?")[0].split("#")[0] === pathname) return;

      startNavigation(href);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startNavigation]);

  // Detect when pathname actually changes → navigation complete
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      stopNavigation();
    }
  }, [pathname, stopNavigation]);

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        startNavigation,
        stopNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
