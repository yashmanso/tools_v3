'use client';

import { useEffect, useRef } from 'react';
import { usePanels } from './PanelContext';
import { ResourceMetadata } from '../lib/markdown';
import { BookmarkButton } from './BookmarkButton';
import { ShareButton } from './ShareButton';
import { addRecentView } from '../lib/recentViews';

interface SlidingPanelsProps {
  children: React.ReactNode;
  allResources?: ResourceMetadata[];
}

export function SlidingPanels({ children, allResources = [] }: SlidingPanelsProps) {
  const { panels, removePanel, expandedPanelId, togglePanelExpand } = usePanels();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Helper to get resource from panel path
  const getResourceFromPath = (path: string): ResourceMetadata | null => {
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const category = pathParts[0];
      const slug = pathParts[1];
      return allResources.find(r => r.category === category && r.slug === slug) || null;
    }
    return null;
  };

  // Auto-scroll to the rightmost panel when a new panel is added
  useEffect(() => {
    if (containerRef.current && !expandedPanelId) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [panels.length, expandedPanelId]);

  // Track page views when panels are opened
  const trackedPanelIdsRef = useRef<Set<string>>(new Set());
  const previousPanelCountRef = useRef<number>(0);
  const allResourcesRef = useRef(allResources);
  
  // Keep allResources ref up to date
  useEffect(() => {
    allResourcesRef.current = allResources;
  }, [allResources]);
  
  useEffect(() => {
    // Only track when panels count increases (new panel added)
    if (panels.length > previousPanelCountRef.current && allResourcesRef.current.length > 0) {
      previousPanelCountRef.current = panels.length;
      
      // Get the most recently added panel
      const latestPanel = panels[panels.length - 1];
      
      if (latestPanel && !trackedPanelIdsRef.current.has(latestPanel.id)) {
        trackedPanelIdsRef.current.add(latestPanel.id);
        
        // Helper function to find resource from path
        const pathParts = latestPanel.path.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          const category = pathParts[0];
          const slug = pathParts[1];
          const resource = allResourcesRef.current.find(r => r.category === category && r.slug === slug);
          
          if (resource) {
            addRecentView(resource);
          }
        }
      }
    } else if (panels.length < previousPanelCountRef.current) {
      // Panel was removed, update count
      previousPanelCountRef.current = panels.length;
      // Clear tracked IDs for removed panels
      const currentPanelIds = new Set(panels.map(p => p.id));
      trackedPanelIdsRef.current = new Set(
        Array.from(trackedPanelIdsRef.current).filter(id => currentPanelIds.has(id))
      );
    }
  }, [panels.length]);

  const isExpanded = expandedPanelId !== null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main content area - hidden when a panel is expanded, otherwise 50% width when panels are open */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          isExpanded ? 'w-0 opacity-0 overflow-hidden' : panels.length > 0 ? 'w-1/2 overflow-y-auto overscroll-contain' : 'flex-1 overflow-y-auto'
        }`}
      >
        <div className="container mx-auto px-6 py-12 max-w-5xl bg-[var(--bg-primary)]">
          {children}
        </div>
      </div>

      {/* Sliding panels */}
      {panels.length > 0 && (
        <div
          ref={containerRef}
          className={`flex-shrink-0 overflow-x-auto overflow-y-hidden flex border-l border-[var(--border)] transition-all duration-300 ${
            isExpanded ? 'flex-1' : 'w-1/2'
          }`}
          style={{ 
            scrollSnapType: isExpanded ? 'none' : 'x mandatory'
          }}
        >
          {panels.map((panel) => {
            const isPanelExpanded = expandedPanelId === panel.id;
            const isHidden = isExpanded && !isPanelExpanded;

            return (
              <div
                key={panel.id}
                className={`flex-shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-secondary)] relative transition-all duration-300 ${
                  isPanelExpanded ? 'w-full' : isHidden ? 'w-0 opacity-0 overflow-hidden' : 'w-[500px]'
                }`}
                style={{ 
                  scrollSnapAlign: isExpanded ? 'none' : 'start',
                  overscrollBehaviorY: 'contain',
                  overscrollBehaviorX: 'none'
                }}
              >
                {/* Panel header with expand and close buttons */}
                <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-[var(--bg-secondary)]">
                  {/* Expand/Collapse button */}
                  <button
                    onClick={() => togglePanelExpand(panel.id)}
                    className="p-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
                    aria-label={isPanelExpanded ? 'Collapse panel' : 'Expand panel'}
                    title={isPanelExpanded ? 'Collapse panel' : 'Expand panel'}
                  >
                    {isPanelExpanded ? (
                      // Collapse icon (minimize)
                      <svg
                        className="w-5 h-5 text-[var(--text-primary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5"
                        />
                      </svg>
                    ) : (
                      // Expand icon (maximize)
                      <svg
                        className="w-5 h-5 text-[var(--text-primary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Bookmark button */}
                  {(() => {
                    const resource = getResourceFromPath(panel.path);
                    return resource ? (
                      <BookmarkButton resource={resource} size="md" className="page-header" />
                    ) : null;
                  })()}

                  {/* Share button */}
                  {(() => {
                    const resource = getResourceFromPath(panel.path);
                    return resource ? (
                      <ShareButton resource={resource} size="md" className="page-header" />
                    ) : null;
                  })()}

                  {/* Close button */}
                  <button
                    onClick={() => removePanel(panel.id)}
                    className="p-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
                    aria-label="Close panel"
                    title="Close panel"
                  >
                    <svg
                      className="w-5 h-5 text-[var(--text-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className={`px-6 pb-8 ${isPanelExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                  {panel.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
