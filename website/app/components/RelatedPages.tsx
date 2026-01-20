'use client';

import { CardLink } from './CardLink';

interface RelatedPage {
  slug: string;
  title: string;
  category: string;
  score: number;
  reasons: string[];
}

interface RelatedPagesProps {
  pages: RelatedPage[];
  currentCategory: string;
}

export function RelatedPages({ pages, currentCategory }: RelatedPagesProps) {
  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Related Pages
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Discover related resources based on shared tags and topics
      </p>

      <div className="grid gap-3">
        {pages.map((page) => (
          <CardLink
            key={`${page.category}-${page.slug}`}
            href={`/${page.category}/${page.slug}`}
            className="group p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100
                  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {page.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {page.category}
                </p>

                {/* Show relationship reasons */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {page.reasons.slice(0, 2).map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
                        text-gray-600 dark:text-gray-400"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Relevance indicator */}
              <div className="flex-shrink-0 flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getRelevanceColor(page.score),
                  }}
                  title={`Relevance score: ${page.score.toFixed(1)}`}
                />
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </CardLink>
        ))}
      </div>
    </div>
  );
}

/**
 * Get color based on relevance score
 */
function getRelevanceColor(score: number): string {
  if (score >= 6) return '#22c55e'; // green - highly relevant
  if (score >= 4) return '#3b82f6'; // blue - moderately relevant
  if (score >= 2) return '#f59e0b'; // amber - somewhat relevant
  return '#9ca3af'; // gray - loosely related
}
