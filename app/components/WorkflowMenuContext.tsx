'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * State for the workflow menu.
 *
 * The menu used to be a sidebar that slid in and out as the page scrolled,
 * which moved under the reader unasked. It is now a popup opened from the
 * button beside the wordmark: visible only when it is wanted, and never
 * shifting the content behind it.
 *
 * The trigger lives in the header and the menu's contents live in the explore
 * section, so the open state is shared here.
 */

interface WorkflowMenuContextType {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  /** True while the section that owns the menu's contents is mounted. */
  available: boolean;
  setAvailable: (value: boolean) => void;
  /** Bumped to ask the explore section to return to its Overview mode. */
  overviewRequest: number;
  requestOverview: () => void;
}

const WorkflowMenuContext = createContext<WorkflowMenuContextType>({
  open: false,
  openMenu: () => {},
  closeMenu: () => {},
  toggleMenu: () => {},
  available: false,
  setAvailable: () => {},
  overviewRequest: 0,
  requestOverview: () => {},
});

export function WorkflowMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [overviewRequest, setOverviewRequest] = useState(0);

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen(prev => !prev), []);
  const requestOverview = useCallback(() => setOverviewRequest(n => n + 1), []);

  return (
    <WorkflowMenuContext.Provider
      value={{
        open, openMenu, closeMenu, toggleMenu,
        available, setAvailable,
        overviewRequest, requestOverview,
      }}
    >
      {children}
    </WorkflowMenuContext.Provider>
  );
}

export function useWorkflowMenu() {
  return useContext(WorkflowMenuContext);
}
