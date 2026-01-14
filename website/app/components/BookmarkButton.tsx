'use client';

import { useState, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';

interface BookmarkButtonProps {
  resource: ResourceMetadata;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BookmarkButton({ resource, size = 'md', className = '' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // Check initial state
    setBookmarked(isBookmarked(resource.category, resource.slug));

    // Listen for bookmark changes
    const handleBookmarkChange = () => {
      setBookmarked(isBookmarked(resource.category, resource.slug));
    };

    window.addEventListener('bookmarks-changed', handleBookmarkChange);
    return () => {
      window.removeEventListener('bookmarks-changed', handleBookmarkChange);
    };
  }, [resource.category, resource.slug]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(resource);
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Check if this is in a panel header (page-header class) - should match expand/close button style
  const isInPanelHeader = className.includes('page-header');
  
  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-full transition-colors ${className} ${
        bookmarked
          ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border border-yellow-500'
          : isInPanelHeader
          ? 'bg-[var(--bg-primary)] hover:bg-[var(--border)] border border-[var(--border)]'
          : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
      }`}
      title={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${iconSizeClasses[size]} ${isInPanelHeader && !bookmarked ? 'text-[var(--text-primary)]' : ''}`}
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
