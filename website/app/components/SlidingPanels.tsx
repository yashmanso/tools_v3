'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePanels } from './PanelContext';
import type { ResourceMetadata } from '../lib/markdown';
import { BookmarkButton } from './BookmarkButton';
import { ShareButton } from './ShareButton';
import { addRecentView } from '../lib/recentViews';
import { Button } from '@/components/ui/button';

interface SlidingPanelsProps {
  children: React.ReactNode;
  allResources?: ResourceMetadata[];
}

export function SlidingPanels({ children, allResources = [] }: SlidingPanelsProps) {
  const { panels, removePanel, expandedPanelId, togglePanelExpand, collapsePanel } = usePanels();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);
  
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
      // Update scroll state after animation
      setTimeout(updateScrollState, 350);
    }
  }, [panels.length, expandedPanelId, updateScrollState]);

  // Track page views when panels are opened or focused
  const lastTrackedPanelIdRef = useRef<string | null>(null);
  const allResourcesRef = useRef(allResources);
  
  // Keep allResources ref up to date
  useEffect(() => {
    allResourcesRef.current = allResources;
  }, [allResources]);
  
  useEffect(() => {
    if (panels.length === 0) {
      lastTrackedPanelIdRef.current = null;
      return;
    }

    // Track the most recently focused/visible panel
    const latestPanel = panels[panels.length - 1];
    if (!latestPanel || latestPanel.id === lastTrackedPanelIdRef.current) {
      return;
    }

    lastTrackedPanelIdRef.current = latestPanel.id;

    const pathParts = latestPanel.path.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const category = pathParts[0];
      const slug = pathParts[1];
      const resource = allResourcesRef.current.find(r => r.category === category && r.slug === slug);

      if (resource) {
        addRecentView(resource);
      } else {
        // Fallback: record a minimal recent view so the sidebar can still show it
        addRecentView({
          category,
          slug,
          title: latestPanel.title || slug,
        });
      }
    }
  }, [panels]);

  const isExpanded = expandedPanelId !== null;

  // Close expanded panel on ESC key or click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        collapsePanel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Only close if clicking outside the expanded panel
      const target = e.target as HTMLElement;
      const expandedPanelElement = containerRef.current?.querySelector(`[data-panel-id="${expandedPanelId}"]`);
      
      if (expandedPanelElement && !expandedPanelElement.contains(target)) {
        // Check if click is not on a button or interactive element
        const isInteractive = target.closest('button, a, input, textarea, select');
        if (!isInteractive) {
          collapsePanel();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, expandedPanelId, collapsePanel]);

  // Track scroll position for arrow visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    
    // Also update on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);
    
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, panels.length]);

  // Enable horizontal scrolling with mouse wheel or trackpad gesture
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isExpanded || panels.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      // If there's horizontal movement (trackpad gesture), let it scroll naturally
      if (Math.abs(e.deltaX) > 5) {
        return;
      }
      
      // Convert vertical scroll to horizontal without Shift
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const target = e.target as HTMLElement;
        const panel = target.closest('[data-panel-id]') as HTMLElement | null;
        
        // Let panel scroll vertically unless it's at bounds
        if (panel) {
          const hasVerticalScroll = panel.scrollHeight > panel.clientHeight;
          if (hasVerticalScroll) {
            const atTop = panel.scrollTop <= 0;
            const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
            if (!(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0)) {
              return;
            }
          }
        }
        
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 2,
          behavior: 'auto'
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isExpanded, panels.length]);

  // Enable keyboard navigation with arrow keys
  useEffect(() => {
    if (isExpanded || panels.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.closest('input, textarea, select, [contenteditable="true"]');
      if (isTyping) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        containerRef.current?.scrollBy({
          left: 500 * direction,
          behavior: 'smooth'
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, panels.length]);

  return (
    <div 
      className="flex overflow-hidden"
      style={{ height: 'calc(100vh - 5rem)', marginTop: '5rem' }}
    >
      {/* Main content area - hidden when a panel is expanded, otherwise 50% width when panels are open */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          isExpanded ? 'w-0 opacity-0' : panels.length > 0 ? 'w-1/2' : 'flex-1'
        }`}
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <div 
          className="container mx-auto px-6 py-12 max-w-5xl bg-[var(--bg-primary)]"
          style={{ height: '100%', overflowY: 'auto', overscrollBehavior: 'contain' }}
        >
          {children}
        </div>
      </div>

      {/* Sliding panels */}
      {panels.length > 0 && (
        <div className={`flex-shrink-0 relative border-l border-[var(--border)] transition-all duration-300 ${
          isExpanded ? 'flex-1' : 'w-1/2'
        }`}
        style={{ height: '100%' }}
        >
          {/* Navigation arrows - show based on scroll position */}
          {panels.length > 1 && !isExpanded && (
            <>
              {/* Left arrow - only show when can scroll left */}
              {canScrollLeft && (
                <button
                  onClick={() => {
                    if (containerRef.current) {
                      containerRef.current.scrollBy({ left: -500, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-110"
                  aria-label="Previous panel"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Right arrow - only show when can scroll right */}
              {canScrollRight && (
                <button
                  onClick={() => {
                    if (containerRef.current) {
                      containerRef.current.scrollBy({ left: 500, behavior: 'smooth' });
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-110"
                  aria-label="Next panel"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
          
          <div
            ref={containerRef}
            className="flex h-full"
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: isExpanded ? 'none' : 'x mandatory'
            }}
          >
          {panels.map((panel) => {
            const isPanelExpanded = expandedPanelId === panel.id;
            const isHidden = isExpanded && !isPanelExpanded;

            return (
              <div
                key={panel.id}
                data-panel-id={panel.id}
                className={`flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] relative transition-all duration-300 ${
                  isPanelExpanded ? 'w-full' : isHidden ? 'w-0 opacity-0' : 'w-[500px]'
                }`}
                style={{ 
                  height: '100%',
                  overflowY: 'auto',
                  scrollSnapAlign: isExpanded ? 'none' : 'start',
                  overscrollBehaviorY: 'contain',
                  overscrollBehaviorX: 'auto'
                }}
              >
                {/* Panel header with expand and close buttons */}
                <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-[var(--bg-secondary)]">
                  {/* Expand/Collapse button */}
                  <Button variant="ghost"
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
                  </Button>

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
                  <Button variant="ghost"
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
                  </Button>
                </div>

                <div className={`px-6 pb-8 ${isPanelExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                  {panel.content}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
