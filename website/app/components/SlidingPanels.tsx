'use client';

import { useEffect, useRef } from 'react';
import { usePanels } from './PanelContext';

export function SlidingPanels({ children }: { children: React.ReactNode }) {
  const { panels, removePanel, expandedPanelId, togglePanelExpand } = usePanels();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the rightmost panel when a new panel is added
  useEffect(() => {
    if (containerRef.current && !expandedPanelId) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [panels.length, expandedPanelId]);

  const isExpanded = expandedPanelId !== null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main content area - hidden when a panel is expanded, otherwise 50% width when panels are open */}
      <div
        className={`flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'w-0 opacity-0' : panels.length > 0 ? 'w-1/2' : 'flex-1'
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
          style={{ scrollSnapType: isExpanded ? 'none' : 'x mandatory' }}
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
                style={{ scrollSnapAlign: isExpanded ? 'none' : 'start' }}
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
