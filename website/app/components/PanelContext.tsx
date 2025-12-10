'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Panel {
  id: string;
  title: string;
  path: string;
  content: ReactNode;
}

interface PanelContextType {
  panels: Panel[];
  addPanel: (panel: Panel) => void;
  removePanel: (id: string) => void;
  removePanelsAfter: (id: string) => void;
  clearPanels: () => void;
  expandedPanelId: string | null;
  expandPanel: (id: string) => void;
  collapsePanel: () => void;
  togglePanelExpand: (id: string) => void;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);

  const addPanel = (panel: Panel) => {
    setPanels((prev) => {
      // If panel already exists, remove it and all panels after it
      const existingIndex = prev.findIndex((p) => p.path === panel.path);
      if (existingIndex !== -1) {
        return [...prev.slice(0, existingIndex + 1)];
      }
      return [...prev, panel];
    });
  };

  const removePanel = (id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  };

  const removePanelsAfter = (id: string) => {
    setPanels((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      return index === -1 ? prev : prev.slice(0, index + 1);
    });
  };

  const clearPanels = () => {
    setPanels([]);
    setExpandedPanelId(null);
  };

  const expandPanel = (id: string) => {
    setExpandedPanelId(id);
  };

  const collapsePanel = () => {
    setExpandedPanelId(null);
  };

  const togglePanelExpand = (id: string) => {
    setExpandedPanelId((prev) => (prev === id ? null : id));
  };

  return (
    <PanelContext.Provider
      value={{
        panels,
        addPanel,
        removePanel,
        removePanelsAfter,
        clearPanels,
        expandedPanelId,
        expandPanel,
        collapsePanel,
        togglePanelExpand,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}

export function usePanels() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanels must be used within PanelProvider');
  }
  return context;
}
