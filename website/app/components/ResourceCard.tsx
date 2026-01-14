'use client';

import { useState } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ClickableTag } from './ClickableTag';
import { BookmarkButton } from './BookmarkButton';
import { convertMarkdownLinksToHTML } from '../lib/markdownLinks';
import { ScrollAnimation } from './ScrollAnimation';

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
  
  const hasOverview = resource.overview && resource.overview.length > 0;
  const summaryLength = 200; // Increased from 100 to show more text
  const shouldTruncate = hasOverview && resource.overview!.length > summaryLength;
  const fullOverview = resource.overview || '';
  const displaySummary = shouldTruncate && !isExpanded
    ? fullOverview.substring(0, summaryLength) + '...'
    : fullOverview;
  
  // Convert markdown links to HTML
  const overviewWithLinks = convertMarkdownLinksToHTML(displaySummary);

  return (
    <ScrollAnimation delay={animationDelay} direction="slide-up" className="h-full">
      <div className="relative group h-full flex flex-col">
        <PanelLink
          href={`/${resource.category}/${resource.slug}`}
          className="block p-6 pt-12 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md h-full flex flex-col min-h-[280px] hover:no-underline hover-lift"
        >
          {/* Button ribbon area */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {showSelectionButton && (
              <button
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
              </button>
            )}
            <BookmarkButton resource={resource} size="sm" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {resource.title}
          </h3>

          {hasOverview && (
            <div className="mb-3 flex-grow">
              <div 
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: overviewWithLinks }}
                suppressHydrationWarning
              />
              {shouldTruncate && (
                <button
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
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-auto">
            {resource.tags.slice(0, 5).map((tag) => (
              <ClickableTag
                key={tag}
                tag={tag}
                allResources={allResources}
                size="xs"
              />
            ))}
            {resource.tags.length > 5 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{resource.tags.length - 5} more
              </span>
            )}
          </div>
        </PanelLink>
      </div>
    </ScrollAnimation>
  );
}
