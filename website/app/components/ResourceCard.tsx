'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ResourceMetadata } from '../lib/markdown';
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

  // Close on ESC key
  useEffect(() => {
    if (!isExpanded) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);
  
  const normalizedOverview = formatCardOverview(resource.overview || '');
  const hasOverview = normalizedOverview.length > 0;
  const summaryLength = 200;
  const shouldTruncate = hasOverview && normalizedOverview.length > summaryLength;
  const fullOverview = normalizedOverview;
  const displaySummary = shouldTruncate
    ? fullOverview.substring(0, summaryLength) + '...'
    : fullOverview;

  // Expanded card overlay (rendered via portal)
  const expandedOverlay = isExpanded && mounted && createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setIsExpanded(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Expanded card */}
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pt-16">
          {/* Button ribbon area */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            <BookmarkButton resource={resource} size="sm" />
          </div>
          
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {resource.title}
          </h3>

          {hasOverview && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {fullOverview}
              </p>
              <Button 
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show less
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
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

          {/* Link to full page */}
          <a
            href={`/${resource.category}/${resource.slug}`}
            className="mt-4 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View full page →
          </a>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
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
                      setIsExpanded(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show more
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

      {/* Expanded overlay rendered via portal */}
      {expandedOverlay}
    </>
  );
}
