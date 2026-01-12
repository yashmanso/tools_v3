'use client';

import { useState } from 'react';

interface ProgressiveDisclosureProps {
  summary: string;
  details: React.ReactNode;
  summaryLength?: number;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

import { convertMarkdownLinksToHTML } from '../lib/markdownLinks';

export function ProgressiveDisclosure({
  summary,
  details,
  summaryLength = 150,
  className = '',
  expandLabel = 'Show more',
  collapseLabel = 'Show less',
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = summary.length > summaryLength;
  const displaySummary = shouldTruncate && !isExpanded
    ? summary.substring(0, summaryLength) + '...'
    : summary;
  
  // Convert markdown links to HTML
  const summaryWithLinks = convertMarkdownLinksToHTML(displaySummary);
  const fullSummaryWithLinks = convertMarkdownLinksToHTML(summary);

  return (
    <div className={className}>
      <div 
        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: isExpanded ? fullSummaryWithLinks : summaryWithLinks }}
      />
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
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
  );
}
