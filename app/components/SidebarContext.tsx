'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextType {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarVisible: false,
  setSidebarVisible: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  return (
    <SidebarContext.Provider value={{ sidebarVisible, setSidebarVisible }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
