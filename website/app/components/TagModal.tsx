'use client';

import { useEffect, useState, useRef } from 'react';
import { usePanels } from './PanelContext';

interface Resource {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface TagModalProps {
  tag: string;
  resources: Resource[];
  onClose: () => void;
}

// Panel content component for fetching page content (shared with PanelLink pattern)
function PanelContent({ path }: { path: string }) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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

  // Intercept link clicks to open in panels instead of navigating
  useEffect(() => {
    if (!contentRef.current) return;

    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip external links
      if (href.startsWith('http')) {
        return;
      }

      // Skip anchor links
      if (href.startsWith('#')) {
        return;
      }

      e.preventDefault();

      // Open in new panel
      addPanel({
        id: `${href}-${Date.now()}`,
        title: href.split('/').pop() || href,
        path: href,
        content: <PanelContent path={href} />,
      });
    };

    contentRef.current.addEventListener('click', handleLinkClick);
    return () => {
      contentRef.current?.removeEventListener('click', handleLinkClick);
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
    <div
      ref={contentRef}
      className="prose prose-neutral dark:prose-invert max-w-none prose-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function TagModal({ tag, resources, onClose }: TagModalProps) {
  const { addPanel } = usePanels();

  // Filter resources by tag
  const filteredResources = resources.filter((resource) =>
    resource.tags.includes(tag)
  );

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleResourceClick = (e: React.MouseEvent, resource: Resource) => {
    e.preventDefault();
    onClose();

    const href = `/${resource.category}/${resource.slug}`;
    addPanel({
      id: `${href}-${Date.now()}`,
      title: resource.title,
      path: href,
      content: <PanelContent path={href} />,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {tag}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredResources.length} {filteredResources.length === 1 ? 'page' : 'pages'} found
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            title="Close (Esc)"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredResources.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No pages found with this tag
            </p>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <a
                  key={`${resource.category}-${resource.slug}`}
                  href={`/${resource.category}/${resource.slug}`}
                  onClick={(e) => handleResourceClick(e, resource)}
                  className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700
                    hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800
                    transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        {resource.category}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
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
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
