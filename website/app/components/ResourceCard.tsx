'use client';

import { useState, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { CardLink } from './CardLink';
import { ClickableTag } from './ClickableTag';
import { BookmarkButton } from './BookmarkButton';
import { formatCardOverview } from '../lib/markdownLinks';
import { ScrollAnimation } from './ScrollAnimation';
import { Button } from '@/components/ui/button';
import { useTagModal } from './TagModalContext';

interface ResourceCardProps {
  resource: ResourceMetadata;
  allResources: ResourceMetadata[];
  animationDelay?: number;
  showSelectionButton?: boolean;
  isSelected?: boolean;
  canSelect?: boolean;
  onSelect?: () => void;
}

export function ResourceCard({ 
  resource, 
  allResources, 
  animationDelay = 0,
  showSelectionButton = false,
  isSelected = false,
  canSelect = true,
  onSelect
}: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setOpenResourceTags, setOpenTag } = useTagModal();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const normalizedOverview = formatCardOverview(resource.overview || '');
  const hasOverview = normalizedOverview.length > 0;
  const summaryLength = 200; // Increased from 100 to show more text
  const shouldTruncate = hasOverview && normalizedOverview.length > summaryLength;
  const fullOverview = normalizedOverview;
  // Truncation logic - same on server and client (isExpanded starts as false)
  const displaySummary = shouldTruncate && !isExpanded
    ? fullOverview.substring(0, summaryLength) + '...'
    : fullOverview;

  return (
    <ScrollAnimation delay={animationDelay} direction="slide-up" className="h-full">
      <div className="relative group h-full flex flex-col">
        <CardLink
          href={`/${resource.category}/${resource.slug}`}
          className="p-6 pt-16 h-full flex flex-col min-h-[280px]"
        >
          {/* Button ribbon area */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            {showSelectionButton && (
              <Button variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onSelect && canSelect) {
                    onSelect();
                  }
                }}
                disabled={!canSelect && !isSelected}
                className={`p-2 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : canSelect
                    ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                title={isSelected ? 'Remove from comparison' : canSelect ? 'Add to comparison' : 'Maximum 3 tools selected'}
              >
                {isSelected ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </Button>
            )}
            <BookmarkButton resource={resource} size="sm" />
          </div>
          
          <h3
            className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[56px]"
            suppressHydrationWarning
          >
            {resource.title}
          </h3>

          {hasOverview && (
            <div className="mb-3 min-h-[112px]">
              <p
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5"
                suppressHydrationWarning
              >
                {displaySummary}
              </p>
              {shouldTruncate && mounted && (
                <Button variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {isExpanded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-auto min-h-[64px] overflow-hidden">
            {resource.tags.slice(0, 5).map((tag) => (
              <ClickableTag
                key={tag}
                tag={tag}
                allResources={allResources}
                size="xs"
              />
            ))}
            {resource.tags.length > 5 && (
              <Button
                type="button"
                variant="ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpenTag(null);
                  setOpenResourceTags({ title: resource.title, tags: resource.tags });
                }}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                +{resource.tags.length - 5} more
              </Button>
            )}
          </div>
        </CardLink>
      </div>
    </ScrollAnimation>
  );
}
