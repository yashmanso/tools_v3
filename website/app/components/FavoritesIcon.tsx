'use client';

import { useState, useEffect } from 'react';
import { getBookmarks } from '../lib/bookmarks';
import { FavoritesModal } from './FavoritesModal';
import type { ResourceMetadata } from '../lib/markdown';
import { Button } from '@/components/ui/button';

interface FavoritesIconProps {
  allResources: ResourceMetadata[];
}

export function FavoritesIcon({ allResources }: FavoritesIconProps) {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Get initial count
    const updateCount = () => {
      const bookmarks = getBookmarks();
      setBookmarkCount(bookmarks.length);
    };

    updateCount();

    // Listen for bookmark changes
    window.addEventListener('bookmarks-changed', updateCount);
    return () => {
      window.removeEventListener('bookmarks-changed', updateCount);
    };
  }, []);

  return (
    <>
      <Button variant="ghost"
        onClick={() => setIsModalOpen(true)}
        className="relative p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
        aria-label={`View favorites (${bookmarkCount} saved)`}
        title={`View favorites (${bookmarkCount} saved)`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        {bookmarkCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center justify-center">
            {bookmarkCount > 99 ? '99+' : bookmarkCount}
          </span>
        )}
      </Button>
      {isModalOpen && <FavoritesModal allResources={allResources} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
