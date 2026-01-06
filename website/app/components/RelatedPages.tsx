'use client';

import Link from 'next/link';
import { usePanels } from './PanelContext';
import { ContentWithHoverPreviews } from './ContentWithHoverPreviews';

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
  const { addPanel } = usePanels();

  if (pages.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent, page: RelatedPage) => {
    e.preventDefault();
    const href = `/${page.category}/${page.slug}`;

    // Add panel with loading content (will be populated by PanelLink)
    addPanel({
      id: `${href}-${Date.now()}`,
      title: page.title,
      path: href,
      content: <PanelContent path={href} />,
    });
  };

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
          <a
            key={`${page.category}-${page.slug}`}
            href={`/${page.category}/${page.slug}`}
            onClick={(e) => handleClick(e, page)}
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700
              hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800
              transition-all hover:shadow-md cursor-pointer"
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
          </a>
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

// Component to fetch and display panel content
function PanelContent({ path }: { path: string }) {
  const [html, setHtml] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { addPanel } = usePanels();

  React.useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        // Try multiple path formats for compatibility with different hosting configs
        // 1. Clean URL (no extension) - works with Vercel cleanUrls: true
        // 2. With .html extension - works with basic static hosting
        let response = await fetch(path);
        if (!response.ok) {
          response = await fetch(`${path}.html`);
        }
        if (!response.ok) {
          throw new Error('Page not found');
        }

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const mainContent = doc.querySelector('article') || doc.querySelector('main');

        if (mainContent) {
          // Remove the PageHeader buttons (first child div with the buttons)
          const headerDiv = mainContent.querySelector('div.mb-8');
          if (headerDiv) {
            // Keep only the h1 and tag list, remove the button container
            const buttonContainer = headerDiv.querySelector('div.flex.gap-2');
            if (buttonContainer) {
              buttonContainer.remove();
            }
          }
          setHtml(mainContent.innerHTML);
        } else {
          setHtml(htmlText);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setLoading(false);
      }
    }

    fetchContent();
  }, [path]);

  // Note: Link click handling for opening in panels is now handled
  // by ContentWithHoverPreviews component which wraps the content

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Handle link clicks to open in panels
  React.useEffect(() => {
    if (!wrapperRef.current) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();
      addPanel({
        id: `${href}-${Date.now()}`,
        title: href.split('/').pop() || href,
        path: href,
        content: <PanelContent path={href} />,
      });
    };

    wrapperRef.current.addEventListener('click', handleLinkClick);
    return () => {
      wrapperRef.current?.removeEventListener('click', handleLinkClick);
    };
  }, [html, addPanel]);

  return (
    <div ref={wrapperRef}>
      <ContentWithHoverPreviews
        html={html}
        className="prose prose-neutral dark:prose-invert max-w-none prose-sm"
      />
    </div>
  );
}

// Import React for the useState/useEffect
import React from 'react';
