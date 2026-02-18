'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5bbecbae-44aa-4e2f-b557-31f64a471b94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix-1',hypothesisId:'H2',location:'SidebarContext.tsx:toggleSidebar',message:'toggleSidebar invoked',data:{sidebarVisible,sidebarLocked,sidebarMounted},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setSidebarVisible((prev) => !prev);
    setSidebarLocked(true); // manual override — freeze auto-behavior
  }, []);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5bbecbae-44aa-4e2f-b557-31f64a471b94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix-1',hypothesisId:'H2',location:'SidebarContext.tsx:stateEffect',message:'sidebar context state changed',data:{sidebarVisible,sidebarLocked,sidebarMounted},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [sidebarVisible, sidebarLocked, sidebarMounted]);

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
