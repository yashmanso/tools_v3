'use client';

import { useState, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { getRecentViewsAsResources, clearRecentViews } from '../lib/recentViews';
import { PanelLink } from './PanelLink';
import { ScrollAnimation } from './ScrollAnimation';

interface RecentViewsSidebarProps {
  allResources: ResourceMetadata[];
  isOpen: boolean;
  onClose: () => void;
}

export function RecentViewsSidebar({ allResources, isOpen, onClose }: RecentViewsSidebarProps) {
  const [recentResources, setRecentResources] = useState<ResourceMetadata[]>([]);

  useEffect(() => {
    const updateRecentViews = () => {
      const recent = getRecentViewsAsResources(allResources);
      console.log('RecentViewsSidebar - updating with', recent.length, 'items');
      console.log('RecentViewsSidebar - allResources count:', allResources.length);
      console.log('RecentViewsSidebar - recent resources:', recent.map(r => `${r.category}/${r.slug}: ${r.title}`));
      setRecentResources(recent);
    };

    // Initial load
    updateRecentViews();
    
    // Listen for changes
    window.addEventListener('recent-views-changed', updateRecentViews);
    
    return () => {
      window.removeEventListener('recent-views-changed', updateRecentViews);
    };
  }, [allResources]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[150]"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg-secondary)] border-l border-[var(--border)] z-[200] overflow-y-auto shadow-xl">
      <div className="p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recently viewed
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {recentResources.length > 0 && (
          <button
            onClick={clearRecentViews}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {recentResources.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">No recently viewed tools</p>
            <p className="text-xs mt-1">Start browsing to see your history</p>
          </div>
        ) : (
          recentResources.map((resource, index) => (
            <div key={`${resource.category}/${resource.slug}`} className="relative z-10">
              <PanelLink
                href={`/${resource.category}/${resource.slug}`}
                className="block p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-sm hover:no-underline group relative z-10"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {resource.category}
                </p>
              </PanelLink>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
