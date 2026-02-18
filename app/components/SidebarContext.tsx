'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SidebarContextType {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  /** True when the user has manually toggled the sidebar — scroll-based auto-hide/show is paused. */
  sidebarLocked: boolean;
  setSidebarLocked: (locked: boolean) => void;
  /** True when the ExploreSection (which owns the sidebar) is mounted. */
  sidebarMounted: boolean;
  setSidebarMounted: (mounted: boolean) => void;
  /** Convenience: toggle visibility and lock in one call. */
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarVisible: false,
  setSidebarVisible: () => {},
  sidebarLocked: false,
  setSidebarLocked: () => {},
  sidebarMounted: false,
  setSidebarMounted: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
    setSidebarLocked(true); // manual override — freeze auto-behavior
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarVisible,
        setSidebarVisible,
        sidebarLocked,
        setSidebarLocked,
        sidebarMounted,
        setSidebarMounted,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
