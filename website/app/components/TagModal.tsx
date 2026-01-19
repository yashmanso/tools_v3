'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const { openTag, setOpenTag, openResourceTags, setOpenResourceTags } = useTagModal();
  const [mounted, setMounted] = useState(false);

  const filteredResources = openTag
    ? resources.filter((resource) => resource.tags.includes(openTag))
    : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openTag && !openResourceTags) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenTag(null);
        setOpenResourceTags(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openTag, openResourceTags, setOpenTag, setOpenResourceTags]);

  const handleResourceClick = (e: React.MouseEvent, resource: Resource) => {
    e.preventDefault();
    setOpenTag(null);
    setOpenResourceTags(null);

    const href = `/${resource.category}/${resource.slug}`;
    addPanel({
      id: `${href}-${Date.now()}`,
      title: resource.title,
      path: href,
      content: <PanelContent path={href} />,
    });
  };

  if ((!openTag && !openResourceTags) || !mounted) return null;

  const title = openTag ? openTag : openResourceTags?.title || 'Tags';
  const subtitle = openTag
    ? `${filteredResources.length} ${filteredResources.length === 1 ? 'page' : 'pages'} found`
    : `${openResourceTags?.tags.length || 0} tags`;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[150]"
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return;
          setOpenTag(null);
          setOpenResourceTags(null);
        }}
      />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg-secondary)] border-l border-[var(--border)] z-[200] overflow-y-auto shadow-xl flex flex-col">
        <div className="p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)] flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setOpenTag(null);
                setOpenResourceTags(null);
              }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close tag sidebar"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {openTag ? (
            filteredResources.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No pages found with this tag</p>
                <p className="text-xs mt-1">Try another tag</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div key={`${resource.category}/${resource.slug}`} className="relative z-10">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={(e) => handleResourceClick(e, resource)}
                    className="w-full text-left block p-3 rounded-xl hover:shadow-sm group relative z-10"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {resource.title}
                    </h3>
                  </Button>
                </div>
              ))
            )
          ) : (
            openResourceTags?.tags.map((tag) => (
              <Button
                key={tag}
                variant="ghost"
                type="button"
                onClick={() => {
                  setOpenResourceTags(null);
                  setOpenTag(tag);
                }}
                className="w-full text-left block p-3 rounded-xl hover:shadow-sm group relative z-10"
                title={`Click to see all pages with tag: ${tag}`}
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tag.replace(/-/g, ' ')}
                </h3>
              </Button>
            ))
          )}
        </div>
      </div>
    </>
  , document.body);
}
