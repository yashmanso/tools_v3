'use client';

import { ReactNode, MouseEvent, useState, useEffect } from 'react';
import { usePanels } from './PanelContext';

interface PanelLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  openInPanel?: boolean;
}

export function PanelLink({ href, children, className, openInPanel = true }: PanelLinkProps) {
  const { addPanel } = usePanels();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!openInPanel) {
      return; // Let default navigation happen
    }

    e.preventDefault();

    // For external links, open in new tab
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    // Add panel with content
    addPanel({
      id: `${href}-${Date.now()}`,
      title: href.split('/').pop() || href,
      path: href,
      content: <PanelContent path={href} />,
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}

// Component to fetch and display panel content
function PanelContent({ path }: { path: string }) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        // Fetch the actual page
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error('Page not found');
        }

        const htmlText = await response.text();

        // Extract just the main content from the fetched HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const mainContent = doc.querySelector('article') || doc.querySelector('main');

        if (mainContent) {
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
      className="prose prose-neutral dark:prose-invert max-w-none prose-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
