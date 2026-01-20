'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ResourceMetadata } from '../lib/markdown';
import { BookmarkButton } from './BookmarkButton';
import { ShareButton } from './ShareButton';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  resource?: ResourceMetadata;
}

export function PageHeader({ title, children, resource }: PageHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Clean up expanded state on unmount
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('page-expanded');
    };
  }, []);

  const handleClose = () => {
    // Remove expanded class before navigating
    document.documentElement.classList.remove('page-expanded');
    // Navigate back to the category page
    router.back();
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Toggle fullscreen mode on the document
    if (!isExpanded) {
      document.documentElement.classList.add('page-expanded');
    } else {
      document.documentElement.classList.remove('page-expanded');
    }
  };

  return (
    <div className="mb-8">
      {/* Header with title and action buttons */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-4xl font-bold flex-1">{title}</h1>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {/* Expand/Collapse button */}
          <Button variant="ghost"
            onClick={handleToggleExpand}
            className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
            aria-label={isExpanded ? 'Collapse page' : 'Expand page'}
            title={isExpanded ? 'Collapse page' : 'Expand page'}
          >
            {isExpanded ? (
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
          {resource && (
            <BookmarkButton resource={resource} size="md" className="page-header" />
          )}
          
          {/* Share button */}
          {resource && (
            <ShareButton resource={resource} />
          )}
          
          {/* Close button */}
          <Button variant="ghost"
            onClick={handleClose}
            className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
            aria-label="Close page"
            title="Close page (go back)"
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
      </div>

      {/* Additional content (like tags) */}
      {children}
    </div>
  );
}
