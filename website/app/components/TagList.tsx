'use client';

import { useRef } from 'react';
import { useTagModal } from './TagModalContext';
import { Button } from '@/components/ui/button';

interface Resource {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface TagListProps {
  tags: string[];
  allResources: Resource[];
  resourceTitle?: string;
}

export function TagList({ tags, allResources, resourceTitle }: TagListProps) {
  const { openTag, setOpenTag, setOpenResourceTags } = useTagModal();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTagClick = (tag: string) => {
    // Toggle: if already open, close it; otherwise open it
    setOpenResourceTags(null);
    setOpenTag(openTag === tag ? null : tag);
  };

  // Always show 3 tags initially
  const INITIAL_VISIBLE_COUNT = 3;

  // Don't render anything if no tags
  if (tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = Math.max(0, tags.length - INITIAL_VISIBLE_COUNT);
  const hasMoreTags = hiddenCount > 0;

  return (
    <div ref={containerRef} className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Visible tags */}
        {visibleTags.map((tag, index) => (
          <Button variant="ghost"
            key={`${tag}-${index}`}
            type="button"
            onClick={() => handleTagClick(tag)}
            className="tag cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-200 active:scale-95"
            title={`Click to see all pages with tag: ${tag}`}
          >
            {tag}
          </Button>
        ))}

        {/* Expand button */}
        {hasMoreTags && (
          <Button variant="ghost"
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpenTag(null);
              setOpenResourceTags({ title: resourceTitle || 'Tags', tags });
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpenTag(null);
              setOpenResourceTags({ title: resourceTitle || 'Tags', tags });
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
            title={`Show ${hiddenCount} more tags`}
          >
            <span>+{hiddenCount} more</span>
            <svg
              className="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
