'use client';

import { ReactNode, MouseEvent } from 'react';
import { usePanels } from './PanelContext';
import { ResourcePanelContent } from './ResourcePanelContent';

interface PanelLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  openInPanel?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function PanelLink({ href, children, className, openInPanel = true, onClick }: PanelLinkProps) {
  const { addPanel } = usePanels();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!openInPanel) {
      return; // Let default navigation happen
    }

    e.preventDefault();

    // For external links, open in new tab
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    // Add panel with React component content (not HTML fetch)
    addPanel({
      id: `${href}-${Date.now()}`,
      title: href.split('/').pop() || href,
      path: href,
      content: <ResourcePanelContent path={href} />,
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
