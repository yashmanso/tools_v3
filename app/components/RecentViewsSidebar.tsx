'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ResourceMetadata } from '../lib/markdown';
import { getRecentViewsAsResources, clearRecentViews } from '../lib/recentViews';
import { CardLink } from './CardLink';
import { ScrollAnimation } from './ScrollAnimation';
import { Button } from '@/components/ui/button';

interface RecentViewsSidebarProps {
  allResources: ResourceMetadata[];
  isOpen: boolean;
  onClose: () => void;
}

export function RecentViewsSidebar({ allResources, isOpen, onClose }: RecentViewsSidebarProps) {
  const [recentResources, setRecentResources] = useState<ResourceMetadata[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateRecentViews = () => {
      const recent = getRecentViewsAsResources(allResources);
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

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
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
          <Button variant="ghost"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        {recentResources.length > 0 && (
          <Button variant="ghost"
            onClick={clearRecentViews}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear history
          </Button>
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
              <CardLink
                href={`/${resource.category}/${resource.slug}`}
                className="p-3 rounded-xl hover:shadow-sm group relative z-10"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {resource.category}
                </p>
              </CardLink>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  , document.body);
}
