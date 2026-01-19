'use client';

import { useEffect, useRef, useState } from 'react';
import { usePanels } from './PanelContext';
import { ContentWithHoverPreviews } from './ContentWithHoverPreviews';
import { useTagModal } from './TagModalContext';
import { Button } from '@/components/ui/button';

interface Resource {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface TagModalProps {
  resources: Resource[];
}

// Panel content component for fetching page content (shared with PanelLink pattern)
function PanelContent({ path }: { path: string }) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { addPanel } = usePanels();

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        // Try multiple path formats for compatibility with different hosting configs
        let response = await fetch(path);
        if (!response.ok) {
          response = await fetch(`${path}.html`);
        }
        if (!response.ok) {
          throw new Error('Page not found');
        }

        const htmlText = await response.text();

        // Extract just the main content from the fetched HTML
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

  // Handle link clicks to open in panels
  useEffect(() => {
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

  return (
    <div ref={wrapperRef}>
      <ContentWithHoverPreviews
        html={html}
        className="prose prose-neutral dark:prose-invert max-w-none prose-sm"
      />
    </div>
  );
}

export function TagModal({ resources }: TagModalProps) {
  const { addPanel } = usePanels();
  const { openTag, setOpenTag } = useTagModal();

  // Filter resources by tag
  const filteredResources = openTag
    ? resources.filter((resource) => resource.tags.includes(openTag))
    : [];

  // Close on Escape key
  useEffect(() => {
    if (!openTag) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenTag(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Don't hide body overflow - let the modal handle its own scrolling

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openTag, setOpenTag]);

  const handleResourceClick = (e: React.MouseEvent, resource: Resource) => {
    e.preventDefault();
    setOpenTag(null); // Close modal when resource is clicked

    const href = `/${resource.category}/${resource.slug}`;
    addPanel({
      id: `${href}-${Date.now()}`,
      title: resource.title,
      path: href,
      content: <PanelContent path={href} />,
    });
  };

  if (!openTag) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setOpenTag(null)}
      onMouseDown={(e) => {
        // Close when clicking on the overlay
        if (e.target === e.currentTarget) {
          setOpenTag(null);
        }
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header - sticky */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {openTag}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {filteredResources.length} {filteredResources.length === 1 ? 'page' : 'pages'} found
            </p>
          </div>
          <Button variant="ghost"
            onClick={() => setOpenTag(null)}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close (Esc)"
          >
            <svg
              className="w-5 h-5"
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

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredResources.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No pages found with this tag
            </p>
          ) : (
            <div className="space-y-2">
              {filteredResources.map((resource) => (
                <Button variant="ghost"
                  key={`${resource.category}-${resource.slug}`}
                  type="button"
                  onClick={(e) => handleResourceClick(e, resource)}
                  className="w-full text-left block p-3 rounded-xl border border-gray-200 dark:border-gray-700
                    hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800
                    transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {resource.category}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
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
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
